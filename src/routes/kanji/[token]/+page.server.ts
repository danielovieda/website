import { error } from '@sveltejs/kit'
import { verifyWorkToken } from '$lib/server/work-token'
import { listKanji, recentActivity } from '$lib/server/kanji'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, url }) => {
  // Reuses the work link's secret and rotation: one signed capability for the
  // private surfaces on this site rather than a second secret to manage.
  if (!verifyWorkToken(params.token)) throw error(404, 'Not found')
  const lv = url.searchParams.get('level')
  const level = lv === 'N5' || lv === 'N4' || lv === 'N2' || lv === 'N1' ? lv : undefined
  return { level: level ?? null, kanji: await listKanji(level), activity: await recentActivity() }
}
