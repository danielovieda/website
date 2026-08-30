import { error, fail } from '@sveltejs/kit'
import { verifyWorkToken } from '$lib/server/work-token'
import { getKanji, neighbours, recordReps, totalReps } from '$lib/server/kanji'
import type { Actions, PageServerLoad } from './$types'

function localToday() {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const g = (t: string) => p.find((x) => x.type === t)!.value
  return `${g('year')}-${g('month')}-${g('day')}`
}

export const load: PageServerLoad = async ({ params }) => {
  if (!verifyWorkToken(params.token)) throw error(404, 'Not found')
  const ch = decodeURIComponent(params.ch)
  const k = await getKanji(ch)
  if (!k) throw error(404, 'Not found')
  const { prev, next } = await neighbours(ch)
  return {
    ch: k.ch, level: k.level, strokeCount: k.strokeCount, svg: k.svg,
    words: k.words, meanings: k.meanings, onReadings: k.onReadings,
    kunReadings: k.kunReadings, wordCount: k.wordCount,
    reps: await totalReps(ch), prev, next,
  }
}

export const actions: Actions = {
  // Re-verified: a successful load does not authorise a later POST.
  rep: async ({ params, request }) => {
    if (!verifyWorkToken(params.token)) throw error(404, 'Not found')
    const n = Number((await request.formData()).get('count') || 1)
    if (!Number.isSafeInteger(n) || n < 1 || n > 200) return fail(400, { error: 'Bad count.' })
    const total = await recordReps(decodeURIComponent(params.ch), n, localToday())
    return { saved: true, today: total }
  },
}
