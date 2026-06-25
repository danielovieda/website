import type { Handle } from '@sveltejs/kit'
import { building } from '$app/environment'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { auth, ADMIN_EMAIL } from '$lib/server/auth'
import { readVisitorIdFromCookie } from '$lib/server/visitor-session'

export const handle: Handle = async ({ event, resolve }) => {
  // Default locals
  event.locals.session = null
  event.locals.user = null
  event.locals.visitorId = null

  // Visitor cookie (signed)
  try {
    const visitorId = readVisitorIdFromCookie(event)
    event.locals.visitorId = visitorId
  } catch {
    event.locals.visitorId = null
  }

  // Admin session (better-auth)
  try {
    const result = await auth.api.getSession({ headers: event.request.headers })
    if (result?.user && result.user.email.toLowerCase() === ADMIN_EMAIL) {
      event.locals.session = result.session
      event.locals.user = result.user
    }
  } catch {
    // Treat as unauthenticated.
  }

  // Hard gate on /admin paths: must be the single admin.
  // The /admin login page itself is allowed so the admin can sign in.
  if (event.url.pathname.startsWith('/admin') && event.url.pathname !== '/admin') {
    if (!event.locals.user) {
      return new Response('Unauthorized', {
        status: 302,
        headers: { Location: '/admin' },
      })
    }
  }

  // Same gate, JSON flavor, for the admin API surface.
  if (event.url.pathname.startsWith('/api/admin')) {
    if (!event.locals.user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return svelteKitHandler({ event, resolve, auth, building })
}
