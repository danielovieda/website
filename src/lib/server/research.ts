/**
 * Server helpers for house research.
 *
 * The house machine owns the research queue and the verification workflow;
 * this module is only the published copy. Two operations:
 *
 *   publishResearch()  house machine posts verified findings
 *   getResearch()      the /research/<ref> page renders them
 */

import { eq } from 'drizzle-orm'
import { db } from './db'
import { researchItems, type ResearchItem, type ResearchVideo } from './db/schema'

export type PublishResearchInput = {
  ref: number
  title: string
  question: string
  findings: string
  videos: ResearchVideo[]
  estHours: number | null
  verdict: string | null
  project: string | null
}

/**
 * Upsert on ref, so re-running a night's research corrects the existing page
 * instead of publishing a second copy at a different URL. createdAt is left
 * alone on conflict — the link in an email already sent must keep working and
 * keep saying when the work was first done.
 */
export async function publishResearch(input: PublishResearchInput): Promise<ResearchItem> {
  const [row] = await db
    .insert(researchItems)
    .values({ id: crypto.randomUUID(), ...input })
    .onConflictDoUpdate({
      target: researchItems.ref,
      set: {
        title: input.title,
        question: input.question,
        findings: input.findings,
        videos: input.videos,
        estHours: input.estHours,
        verdict: input.verdict,
        project: input.project,
        updatedAt: new Date(),
      },
    })
    .returning()

  // onConflictDoUpdate always writes, so returning() always yields a row —
  // but a silent undefined here would surface as a broken link in an email
  // that has already gone out. Fail loudly instead; the caller 500s and sends
  // nothing.
  if (!row) throw new Error(`publishResearch: no row returned for ref ${input.ref}`)
  return row
}

export async function getResearch(ref: number): Promise<ResearchItem | null> {
  const [row] = await db.select().from(researchItems).where(eq(researchItems.ref, ref)).limit(1)
  return row ?? null
}
