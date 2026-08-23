/**
 * Server helpers for the work checklist.
 *
 * Postgres is the source of truth. The page writes it, the house machine reads
 * it over /api/work to build weekday reminders. Nothing here assumes a user
 * id — there is exactly one owner, reached through a signed link.
 */

import { and, asc, eq, isNotNull, ne, or, sql } from 'drizzle-orm'
import { db } from './db'
import { workItems, type WorkItem } from './db/schema'

const ZONE = 'America/Los_Angeles'

/**
 * The owner's local date and clock, never the server's.
 *
 * Vercel runs in UTC. After 17:00 Pacific the UTC date is already tomorrow, so
 * anything derived from `new Date()` directly rolls deadlines to the wrong day
 * — a Thursday task ticked off on Thursday evening would schedule the Thursday
 * after next, and a deadline today would read as overdue.
 */
function localNow(): { date: string; clock: string; weekday: number } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now)
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? '00'
  const date = `${p('year')}-${p('month')}-${p('day')}`
  // Weekday of that LOCAL date, computed from the string so it cannot drift.
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return { date, clock: `${p('hour')}:${p('minute')}`, weekday }
}


export type NewWorkItem = {
  title: string
  notes?: string | null
  kind?: 'task' | 'idea'
  priority?: number
  dueDate?: string | null
  dueTime?: string | null
  recur?: 'weekly' | null
  recurWeekday?: number | null
}

export async function listWork(includeDone = false): Promise<WorkItem[]> {
  const rows = await db
    .select()
    .from(workItems)
    .where(includeDone ? ne(workItems.status, 'dropped') : eq(workItems.status, 'open'))
    // Dated work first and soonest-first; undated falls to the end by
    // priority. NULLS LAST is explicit because Postgres sorts NULLs first on
    // ASC, which would put every undated idea above tomorrow's deadline.
    .orderBy(
      sql`${workItems.dueDate} ASC NULLS LAST`,
      asc(workItems.priority),
      asc(workItems.createdAt)
    )
  return rows
}

export async function addWork(input: NewWorkItem): Promise<WorkItem> {
  const [row] = await db
    .insert(workItems)
    .values({
      id: crypto.randomUUID(),
      title: input.title,
      notes: input.notes ?? null,
      kind: input.kind ?? 'task',
      priority: input.priority ?? 3,
      dueDate: input.dueDate || null,
      dueTime: input.dueTime || null,
      recur: input.recur ?? null,
      recurWeekday: input.recurWeekday ?? null,
    })
    .returning()
  if (!row) throw new Error('addWork: no row returned')
  return row
}

/**
 * The next occurrence of `weekday` STRICTLY after `from`, as YYYY-MM-DD.
 *
 * Strictly after, deliberately: ticking off Thursday's memo on Thursday must
 * schedule next Thursday, not today. A same-day result would mark the task
 * complete and immediately show it due again, which reads as a bug and is
 * indistinguishable from one.
 */
export function nextWeekday(fromDate: string, fromWeekday: number, weekday: number): string {
  const d = new Date(`${fromDate}T00:00:00Z`)
  const delta = (weekday - fromWeekday + 7) % 7 || 7
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/**
 * Toggle open <-> done.
 *
 * A RECURRING item is never closed. Completing it rolls its deadline to the
 * next occurrence and leaves it open, with completedAt recording when it was
 * last done. Closing it would mean the weekly memo vanishes off the list the
 * first time it is filed, which is exactly when it needs to come back.
 *
 * completedAt is cleared on reopen so it never claims a completion date for
 * something outstanding.
 */
export async function toggleWork(id: string): Promise<WorkItem | null> {
  const [current] = await db.select().from(workItems).where(eq(workItems.id, id)).limit(1)
  if (!current) return null

  const done = current.status !== 'done'
  const now = localNow()

  if (done && current.recur === 'weekly' && current.recurWeekday !== null) {
    const [row] = await db
      .update(workItems)
      .set({
        status: 'open',
        completedAt: new Date(),
        dueDate: nextWeekday(now.date, now.weekday, current.recurWeekday),
        updatedAt: new Date(),
      })
      .where(eq(workItems.id, id))
      .returning()
    return row ?? null
  }

  const [row] = await db
    .update(workItems)
    .set({
      status: done ? 'done' : 'open',
      completedAt: done ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(workItems.id, id))
    .returning()
  return row ?? null
}

export async function updateWork(
  id: string,
  patch: Partial<NewWorkItem> & { status?: 'open' | 'done' | 'dropped' }
): Promise<WorkItem | null> {
  const [row] = await db
    .update(workItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(workItems.id, id))
    .returning()
  return row ?? null
}

/** What the house machine needs to build a reminder. */
export async function workForReminder(): Promise<{
  open: WorkItem[]
  overdue: WorkItem[]
  dueToday: WorkItem[]
}> {
  const open = await listWork(false)
  const { date: today, clock } = localNow()

  const isOverdue = (i: (typeof open)[number]) => {
    if (!i.dueDate) return false
    if (i.dueDate < today) return true
    // Same day: only overdue once the hour has actually passed. Without this
    // a noon deadline reads as merely "due today" at 16:00.
    if (i.dueDate === today && i.dueTime) return i.dueTime.slice(0, 5) < clock
    return false
  }

  return {
    open,
    overdue: open.filter(isOverdue),
    dueToday: open.filter((i) => i.dueDate === today && !isOverdue(i)),
  }
}
