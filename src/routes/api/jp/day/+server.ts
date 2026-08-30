import { json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'
import { isAuthorized } from '$lib/server/jp-auth'
import { recordDay } from '$lib/server/jp'
import { signDayToken } from '$lib/server/jp-token'

const Body = z.object({
  dayN: z.number().int().positive(),
  word: z.string().trim().min(1).max(100),
  reading: z.string().trim().min(1).max(100),
  romaji: z.string().trim().min(1).max(100),
  // Optional: not every word has a kanji form, and older senders omit it.
  written: z.string().trim().max(100).nullish(),
  gloss: z.string().trim().min(1).max(300),
  reviewWords: z
    .array(
      z.object({
        dayN: z.number().int().positive(),
        word: z.string().trim().min(1).max(100),
        gloss: z.string().trim().min(1).max(300),
      })
    )
    .max(20)
    .default([]),
})

/**
 * The house machine announces the item it is about to email, and gets back the
 * survey URL to put in that email.
 *
 * Minting the link here rather than on the house machine is the point: the
 * signing secret never leaves Vercel, so the NUC holds nothing that can forge
 * a link for any other day.
 *
 * Everything that can fail is resolved BEFORE the row is written. It used to
 * write first and then check config, so a missing PUBLIC_SITE_URL returned 500
 * to a caller that then sent no email — while the database had already
 * recorded the day as taught, with sent_at stamped and, on a re-announce, the
 * previous day's word overwritten. The record of what was taught has to stay
 * true, so nothing is written until the response is guaranteed.
 */
export const POST: RequestHandler = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let parsed
  try {
    parsed = Body.parse(await request.json())
  } catch {
    return json({ ok: false, error: 'Invalid input' }, { status: 400 })
  }

  let surveyUrl: string
  try {
    const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '')
    if (!base) throw new Error('PUBLIC_SITE_URL is not configured')
    // Throws when JP_LINK_SECRET is unset — deliberately, and before any write.
    surveyUrl = `${base}/jp/${signDayToken(parsed.dayN)}`
  } catch (err) {
    console.error('jp/day: cannot build survey link:', err)
    return json({ ok: false, error: 'Server is not configured to build survey links' }, { status: 500 })
  }

  try {
    const row = await recordDay(parsed)
    return json({ ok: true, dayN: row.dayN, surveyUrl })
  } catch (err) {
    // Without this the caller gets SvelteKit's HTML 500 and its JSON parse
    // blows up on a response this endpoint promises will be JSON.
    console.error('jp/day: write failed:', err)
    return json({ ok: false, error: 'Could not record the day' }, { status: 500 })
  }
}
