import { error } from '@sveltejs/kit'
import { getResearch } from '$lib/server/research'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  // Route key is the house machine's research.id. Anything non-numeric is a
  // 404 rather than a NaN query.
  const ref = Number(params.id)
  if (!Number.isSafeInteger(ref) || ref <= 0) throw error(404, 'Not found')

  const item = await getResearch(ref)
  if (!item) throw error(404, 'Not found')

  return {
    ref: item.ref,
    title: item.title,
    question: item.question,
    findings: item.findings,
    videos: item.videos,
    estHours: item.estHours,
    verdict: item.verdict,
    project: item.project,
    createdAt: item.createdAt.toISOString(),
  }
}
