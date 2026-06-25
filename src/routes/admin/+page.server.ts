/**
 * Admin login server load.
 *
 * Reports whether any admin user exists yet. If not, the page exposes a
 * one-time "create the admin account" flow — better-auth's `before` hook still
 * enforces the ADMIN_EMAIL allowlist, so even if someone discovered this page
 * during the cold-start window, they couldn't sign up as someone other than
 * ovieda@gmail.com.
 */

import { sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { ADMIN_EMAIL } from '$lib/server/auth'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const result = await db.execute(sql`SELECT COUNT(*)::int AS count FROM "user"`)
  const rows = result as unknown as Array<{ count: number }>
  const count = rows[0]?.count ?? 0
  return {
    hasAnyUser: count > 0,
    adminEmail: ADMIN_EMAIL,
  }
}
