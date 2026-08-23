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

export type NewWorkItem = {
  title: string
  notes?: string | null
  kind?: 'task' | 'idea'
  priority?: number
  dueDate?: string | null
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
    })
    .returning()
  if (!row) throw new Error('addWork: no row returned')
  return row
}

/** Toggle open <-> done. completedAt is cleared on reopen so it never claims
 *  a completion date for something still outstanding. */
export async function toggleWork(id: string): Promise<WorkItem | null> {
  const [current] = await db.select().from(workItems).where(eq(workItems.id, id)).limit(1)
  if (!current) return null
  const done = current.status !== 'done'
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
  const today = new Date().toISOString().slice(0, 10)
  return {
    open,
    overdue: open.filter((i) => i.dueDate && i.dueDate < today),
    dueToday: open.filter((i) => i.dueDate === today),
  }
}
