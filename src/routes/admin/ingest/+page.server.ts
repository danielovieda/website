/**
 * Ingest page server load — surface the last-ingest timestamp and chunk count
 * so the admin doesn't fire-and-forget without context.
 */

import { sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS count, MAX(created_at) AS last_created
    FROM resume_chunks
  `)
  const rows = result as unknown as Array<{ count: number; last_created: Date | string | null }>
  const row = rows[0]
  return {
    count: row?.count ?? 0,
    lastIngestAt: row?.last_created ? new Date(row.last_created).toISOString() : null,
  }
}
