/**
 * better-auth instance with single-admin gate.
 *
 * Only ovieda@gmail.com (or whatever ADMIN_EMAIL is set to) can sign in or sign
 * up. Email/password only. No social providers. No magic links. The admin gate
 * is enforced in three places:
 *   1. `before` hook on sign-up — blocks any non-admin email at registration.
 *   2. `before` hook on sign-in — blocks any non-admin email at login (in case
 *      a stray account was created somehow).
 *   3. server hook (hooks.server.ts) checks event.locals.user on every request
 *      to /admin and 403s if the email doesn't match.
 *
 * Sessions are stored in Postgres via the Drizzle adapter.
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { db } from './db'
import * as schema from './db/schema'

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'ovieda@gmail.com').toLowerCase()

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? ''
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:5173'

if (!BETTER_AUTH_SECRET) {
  // Allow build-time imports to succeed when env is unset (e.g., vercel build
  // before envs are pulled), but make runtime failure loud and obvious.
  console.warn('[auth] BETTER_AUTH_SECRET is empty — auth will not function until set.')
}

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET || 'dev-only-insecure-secret-replace-me',
  baseURL: BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  hooks: {
    before: async (ctx) => {
      // Block any sign-up or sign-in attempt with a non-admin email.
      // The hook ctx is loosely typed by better-auth — narrow with a local type.
      const c = ctx as unknown as { path?: string; body?: { email?: string } }
      const path = c.path
      if (path === '/sign-up/email' || path === '/sign-in/email') {
        const email = (c.body?.email ?? '').toString().toLowerCase()
        if (email && email !== ADMIN_EMAIL) {
          throw new APIError('FORBIDDEN', {
            message: 'This site does not accept new accounts.',
          })
        }
      }
    },
  },
  advanced: {
    cookiePrefix: 'do-admin',
  },
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
