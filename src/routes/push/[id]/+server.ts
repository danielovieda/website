import { error, text, type RequestHandler } from '@sveltejs/kit'
import { BUILD_ID } from '$lib/server/build-id'

/**
 * Deploy verification. Returns 200 "OK" only for the build id compiled into
 * this bundle; anything else is a 404. Polling it after a push distinguishes
 * "deployed" from "Vercel is still serving the previous build".
 */
export const GET: RequestHandler = async ({ params }) => {
  if (params.id !== BUILD_ID) throw error(404, 'Not found')
  return text(`OK ${BUILD_ID}\n`, { headers: { 'cache-control': 'no-store' } })
}
