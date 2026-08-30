/**
 * Kanji practice data.
 *
 * The set is built from Dan's own word catalogue, so every character here
 * appears in something the daily lesson is teaching him. Stroke data is
 * KanjiVG (Japanese), stored inline.
 */

import { and, asc, desc, eq, sql as raw } from 'drizzle-orm'
import { db } from './db'
import { kanji, kanjiReps, type Kanji } from './db/schema'

export type KanjiSummary = {
  ch: string
  level: string
  strokeCount: number
  reps: number
}

/** The grid: every character, with how many times it has been traced. */
export async function listKanji(level?: 'N5' | 'N4'): Promise<KanjiSummary[]> {
  const rows = await db
    .select({
      ch: kanji.ch,
      level: kanji.level,
      strokeCount: kanji.strokeCount,
      reps: raw<number>`COALESCE((SELECT SUM(r.reps)::int FROM kanji_reps r WHERE r.kanji_ch = ${kanji.ch}), 0)`,
    })
    .from(kanji)
    .where(level ? eq(kanji.level, level) : undefined)
    // Fewest strokes first: it is the only ordering that makes a 687-character
    // grid approachable, and it happens to track difficulty closely.
    .orderBy(asc(kanji.level), asc(kanji.strokeCount), asc(kanji.ch))
  return rows
}

export async function getKanji(ch: string): Promise<Kanji | null> {
  const [row] = await db.select().from(kanji).where(eq(kanji.ch, ch)).limit(1)
  return row ?? null
}

/** Neighbours in the study order, so practice can run without going back to the grid. */
export async function neighbours(ch: string): Promise<{ prev: string | null; next: string | null }> {
  const all = await db
    .select({ ch: kanji.ch })
    .from(kanji)
    .orderBy(asc(kanji.level), asc(kanji.strokeCount), asc(kanji.ch))
  const i = all.findIndex((k) => k.ch === ch)
  if (i === -1) return { prev: null, next: null }
  return {
    prev: i > 0 ? (all[i - 1]?.ch ?? null) : null,
    next: i < all.length - 1 ? (all[i + 1]?.ch ?? null) : null,
  }
}

/**
 * Record tracings. One row per character per day, incremented — so the history
 * is "practised 日 eight times on the 30th", not eight rows.
 */
export async function recordReps(ch: string, count: number, today: string): Promise<number> {
  const [row] = await db
    .insert(kanjiReps)
    .values({ id: crypto.randomUUID(), kanjiCh: ch, reps: count, practicedOn: today })
    .onConflictDoUpdate({
      target: [kanjiReps.kanjiCh, kanjiReps.practicedOn],
      set: { reps: raw`${kanjiReps.reps} + ${count}` },
    })
    .returning({ reps: kanjiReps.reps })
  return row?.reps ?? count
}

export async function totalReps(ch: string): Promise<number> {
  const [row] = await db
    .select({ n: raw<number>`COALESCE(SUM(${kanjiReps.reps})::int, 0)` })
    .from(kanjiReps)
    .where(eq(kanjiReps.kanjiCh, ch))
  return row?.n ?? 0
}

/** Recent activity, for the grid header. */
export async function recentActivity(days = 7) {
  return db
    .select({
      practicedOn: kanjiReps.practicedOn,
      chars: raw<number>`COUNT(DISTINCT ${kanjiReps.kanjiCh})::int`,
      reps: raw<number>`SUM(${kanjiReps.reps})::int`,
    })
    .from(kanjiReps)
    .groupBy(kanjiReps.practicedOn)
    .orderBy(desc(kanjiReps.practicedOn))
    .limit(days)
}
