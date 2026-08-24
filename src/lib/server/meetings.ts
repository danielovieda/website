/**
 * Meetings: a recurring series, one entry per occurrence, an agenda built up
 * between occurrences, and notes written after.
 */

import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from './db'
import { localNow, nextWeekday } from './work'
import {
  meetingAgendaItems,
  meetingEntries,
  meetings,
  workItems,
  type Meeting,
  type MeetingAgendaItem,
  type MeetingEntry,
  type WorkItem,
} from './db/schema'

export async function listMeetings(): Promise<Meeting[]> {
  return db.select().from(meetings).where(eq(meetings.active, true)).orderBy(asc(meetings.title))
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  const [row] = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1)
  return row ?? null
}

/**
 * The date of the occurrence an agenda item should land on: today if the
 * meeting is today, otherwise the next one.
 *
 * Today counts, deliberately. Something remembered on the morning of the 1:1
 * belongs in that 1:1, not next week's — which is exactly when you are most
 * likely to be adding to the list.
 */
export function nextOccurrence(m: Meeting): string {
  const { date: today, weekday } = localNow()
  if (m.recur !== 'weekly' || m.recurWeekday === null) return today
  if (m.recurWeekday === weekday) return today
  return nextWeekday(today, weekday, m.recurWeekday)
}

/** Find or create the entry for a given date. Lazy: no empty rows in advance. */
export async function entryFor(meetingId: string, meetsOn: string): Promise<MeetingEntry> {
  const [existing] = await db
    .select()
    .from(meetingEntries)
    .where(and(eq(meetingEntries.meetingId, meetingId), eq(meetingEntries.meetsOn, meetsOn)))
    .limit(1)
  if (existing) return existing

  const [row] = await db
    .insert(meetingEntries)
    .values({ id: crypto.randomUUID(), meetingId, meetsOn })
    // Two tabs adding an agenda item at once would otherwise race on the
    // unique index and 500 one of them.
    .onConflictDoNothing()
    .returning()
  if (row) return row

  const [after] = await db
    .select()
    .from(meetingEntries)
    .where(and(eq(meetingEntries.meetingId, meetingId), eq(meetingEntries.meetsOn, meetsOn)))
    .limit(1)
  if (!after) throw new Error(`entryFor: could not create or find ${meetingId} ${meetsOn}`)
  return after
}

export type EntryDetail = {
  entry: MeetingEntry
  agenda: MeetingAgendaItem[]
  followUps: WorkItem[]
}

export async function entryDetail(entry: MeetingEntry): Promise<EntryDetail> {
  const agenda = await db
    .select()
    .from(meetingAgendaItems)
    .where(eq(meetingAgendaItems.entryId, entry.id))
    .orderBy(asc(meetingAgendaItems.createdAt))
  const followUps = await db
    .select()
    .from(workItems)
    .where(eq(workItems.meetingEntryId, entry.id))
    .orderBy(asc(workItems.createdAt))
  return { entry, agenda, followUps }
}

/** Every occurrence, newest first — the current one is whatever is on top. */
export async function history(meetingId: string, limit = 40): Promise<EntryDetail[]> {
  const rows = await db
    .select()
    .from(meetingEntries)
    .where(eq(meetingEntries.meetingId, meetingId))
    .orderBy(desc(meetingEntries.meetsOn))
    .limit(limit)
  return Promise.all(rows.map(entryDetail))
}

export async function addAgendaItem(meetingId: string, body: string): Promise<void> {
  const m = await getMeeting(meetingId)
  if (!m) throw new Error('addAgendaItem: no such meeting')
  const entry = await entryFor(meetingId, nextOccurrence(m))
  await db
    .insert(meetingAgendaItems)
    .values({ id: crypto.randomUUID(), entryId: entry.id, body })
}

export async function toggleAgendaItem(id: string): Promise<void> {
  const [cur] = await db
    .select()
    .from(meetingAgendaItems)
    .where(eq(meetingAgendaItems.id, id))
    .limit(1)
  if (!cur) return
  await db
    .update(meetingAgendaItems)
    .set({ discussed: !cur.discussed })
    .where(eq(meetingAgendaItems.id, id))
}

export async function setNotes(entryId: string, notes: string): Promise<void> {
  await db
    .update(meetingEntries)
    .set({ notes: notes || null, updatedAt: new Date() })
    .where(eq(meetingEntries.id, entryId))
}

/** What the reminder needs: the next occurrence of each meeting and its agenda. */
export async function upcomingMeetings(): Promise<
  { title: string; withWhom: string | null; meetsOn: string; meetTime: string | null; agenda: string[] }[]
> {
  const all = await listMeetings()
  const out = []
  for (const m of all) {
    const meetsOn = nextOccurrence(m)
    const [entry] = await db
      .select()
      .from(meetingEntries)
      .where(and(eq(meetingEntries.meetingId, m.id), eq(meetingEntries.meetsOn, meetsOn)))
      .limit(1)
    const agenda = entry
      ? (
          await db
            .select()
            .from(meetingAgendaItems)
            .where(eq(meetingAgendaItems.entryId, entry.id))
            .orderBy(asc(meetingAgendaItems.createdAt))
        )
          .filter((a) => !a.discussed)
          .map((a) => a.body)
      : []
    out.push({
      title: m.title,
      withWhom: m.withWhom,
      meetsOn,
      meetTime: m.meetTime ? m.meetTime.slice(0, 5) : null,
      agenda,
    })
  }
  return out
}
