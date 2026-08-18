import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'
import { getDay, recordFeedback } from '$lib/server/jp'
import { verifyDayToken } from '$lib/server/jp-token'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const dayN = verifyDayToken(params.token)
  if (dayN === null) throw error(404, 'Not found')

  const day = await getDay(dayN)
  if (!day) throw error(404, 'Not found')

  return {
    dayN: day.dayN,
    word: day.word,
    reading: day.reading,
    romaji: day.romaji,
    gloss: day.gloss,
    reviewWords: day.reviewWords,
    answered: day.respondedAt !== null,
    previous: day.respondedAt
      ? {
          difficulty: day.difficulty,
          alreadyKnew: day.alreadyKnew,
          missedReviews: day.missedReviews,
          note: day.note,
        }
      : null,
  }
}

// The note is validated separately: bundling it here meant a 501-character
// note (or 251 emoji — z's max counts UTF-16 units) was reported as "pick an
// answer for both questions", about radios the user had already filled in.
// recordFeedback truncates to 500 anyway.
const Body = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  alreadyKnew: z.enum(['yes', 'no']),
})

export const actions: Actions = {
  default: async ({ params, request }) => {
    const dayN = verifyDayToken(params.token)
    if (dayN === null) throw error(404, 'Not found')

    const form = await request.formData()
    const parsed = Body.safeParse({
      difficulty: form.get('difficulty'),
      alreadyKnew: form.get('alreadyKnew'),
    })
    if (!parsed.success) return fail(400, { error: 'Pick an answer for both questions.' })

    const rawNote = form.get('note')
    const note = typeof rawNote === 'string' ? rawNote : null

    // Checkbox per review word; the value is the review word's own day number.
    const missed = form
      .getAll('missed')
      .map((v) => Number(v))
      .filter((n) => Number.isSafeInteger(n) && n > 0)

    const row = await recordFeedback(dayN, {
      difficulty: parsed.data.difficulty,
      alreadyKnew: parsed.data.alreadyKnew === 'yes',
      missedReviews: missed,
      note,
    })
    if (!row) throw error(404, 'Not found')

    return { saved: true }
  },
}
