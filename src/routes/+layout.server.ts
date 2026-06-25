/**
 * Root layout server load.
 *
 * Exposes the lightweight "chat unlocked" state to every page based on the
 * signed visitor cookie that hooks.server.ts already validated. Admin session
 * is exposed too so the layout can conditionally render an admin-only badge if
 * needed (no nav links — the site has no nav).
 */

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    chatUnlocked: Boolean(locals.visitorId),
    isAdmin: Boolean(locals.user),
  }
}
