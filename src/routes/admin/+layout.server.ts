/**
 * Admin layout server load.
 *
 * The single source of truth for "is the user an admin" is hooks.server.ts —
 * it sets `locals.user` only when better-auth's session matches ADMIN_EMAIL,
 * and redirects any /admin/* path to /admin if there is no admin session. Here
 * we only forward the user info to the layout for display, and handle the
 * inverse: if someone IS signed in and visits /admin (the login page), bounce
 * them to the dashboard.
 */

import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (locals.user && url.pathname === '/admin') {
    throw redirect(303, '/admin/dashboard')
  }
  return {
    user: locals.user
      ? { id: locals.user.id, email: locals.user.email, name: locals.user.name }
      : null,
  }
}
