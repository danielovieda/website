/**
 * Server helpers for the Japanese daily study loop.
 *
 * The house machine owns the curriculum; this module is only the mailbox
 * between the daily email and that machine. Three operations:
 *
 *   recordDay()      house machine announces the item it just emailed
 *   getDay()         survey page renders it
 *   recordFeedback() owner answers the survey
 *   takeFeedback()   house machine consumes answers, exactly once
 */

import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from './db'
import { jpDays, type JpDay, type JpReviewWord } from './db/schema'

export type RecordDayInput = {
  dayN: number
  word: string
  reading: string
  romaji: string
  gloss: string
  reviewWords: JpReviewWord[]
}

/**
 * Upsert on dayN. Re-announcing a day overwrites the item but deliberately
 * leaves any survey answers alone — a resend must not erase a grade.
 */
export async function recordDay(input: RecordDayInput): Promise<JpDay> {
  const [row] = await db
    .insert(jpDays)
    .values({
      id: crypto.randomUUID(),
      dayN: input.dayN,
      word: input.word,
      reading: input.reading,
      romaji: input.romaji,
      gloss: input.gloss,
      reviewWords: input.reviewWords,
    })
    .onConflictDoUpdate({
      target: jpDays.dayN,
      set: {
        word: input.word,
        reading: input.reading,
        romaji: input.romaji,
        gloss: input.gloss,
        reviewWords: input.reviewWords,
        sentAt: new Date(),
      },
    })
    .returning()
  // onConflictDoUpdate always returns a row; assert rather than widen the
  // signature to `| null` and push the impossible case onto every caller.
  if (!row) throw new Error(`recordDay: no row returned for day ${input.dayN}`)
  return row
}

export async function getDay(dayN: number): Promise<JpDay | null> {
  const [row] = await db.select().from(jpDays).where(eq(jpDays.dayN, dayN)).limit(1)
  return row ?? null
}

export type FeedbackInput = {
  difficulty: 'easy' | 'medium' | 'hard'
  alreadyKnew: boolean
  missedReviews: number[]
  note?: string | null
}

/**
 * Record (or correct) the survey answers for a day. Re-submitting overwrites,
 * and clears pulledAt so a correction made after the house machine has already
 * read the row still gets applied on the next pull.
 */
export async function recordFeedback(dayN: number, input: FeedbackInput): Promise<JpDay | null> {
  const [row] = await db
    .update(jpDays)
    .set({
      difficulty: input.difficulty,
      alreadyKnew: input.alreadyKnew,
      missedReviews: input.missedReviews,
      note: input.note?.trim() ? input.note.trim().slice(0, 500) : null,
      respondedAt: new Date(),
      pulledAt: null,
    })
    .where(eq(jpDays.dayN, dayN))
    .returning()
  return row ?? null
}

/**
 * Claim every answered-but-unconsumed row: mark consumed and return what was
 * actually claimed, in ONE statement.
 *
 * This was a select-then-update loop and it was wrong twice over.
 *
 * Lost correction: the SELECT read day 12 as 'easy', the owner re-submitted
 * 'hard' before the UPDATE ran, and the UPDATE still matched (pulled_at was
 * still null) — so 'hard' was marked consumed and the stale 'easy' snapshot
 * was returned. The corrected grade was gone for good, because nothing clears
 * pulled_at again.
 *
 * Double delivery: two overlapping calls — a retry after a timeout, a
 * double-fired cron — both ran the SELECT before either ran its UPDATE, so
 * both returned the same rows and the same grade was applied twice.
 *
 * UPDATE ... RETURNING fixes both. Under READ COMMITTED a concurrent UPDATE
 * blocks on the row lock, re-evaluates its WHERE against the committed row
 * (pulled_at now set) and claims nothing. And a re-submission either lands
 * before this statement, in which case the corrected values are what get
 * returned, or after, in which case it clears pulled_at and the correction is
 * redelivered on the next pull. It is also one round trip instead of N+1.
 */
export async function takeFeedback(): Promise<JpDay[]> {
  const claimed = await db
    .update(jpDays)
    .set({ pulledAt: new Date() })
    .where(and(isNotNull(jpDays.respondedAt), isNull(jpDays.pulledAt)))
    .returning()

  return claimed.sort((a, b) => a.dayN - b.dayN)
}
