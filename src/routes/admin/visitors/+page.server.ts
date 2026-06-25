/**
 * Visitors list — name, contact info, verification timestamp, and total message
 * count across all sessions. Joined in SQL to keep it one round-trip.
 */

import { sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export interface VisitorRow {
  id: string
  name: string
  email: string
  phone: string
  verifiedAt: string | null
  lastSeenAt: string
  messageCount: number
}

export const load: PageServerLoad = async () => {
  const result = await db.execute(sql`
    SELECT
      v.id,
      v.name,
      v.email,
      v.phone,
      v.verified_at,
      v.last_seen_at,
      COALESCE(SUM(msg_counts.cnt), 0)::int AS message_count
    FROM visitors v
    LEFT JOIN (
      SELECT cs.visitor_id, COUNT(cm.id)::int AS cnt
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cm.session_id = cs.id
      GROUP BY cs.visitor_id
    ) msg_counts ON msg_counts.visitor_id = v.id
    GROUP BY v.id
    ORDER BY v.last_seen_at DESC
  `)

  const rows = result as unknown as Array<{
    id: string
    name: string
    email: string
    phone: string
    verified_at: Date | string | null
    last_seen_at: Date | string
    message_count: number
  }>

  const visitors: VisitorRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    verifiedAt: r.verified_at ? new Date(r.verified_at).toISOString() : null,
    lastSeenAt: new Date(r.last_seen_at).toISOString(),
    messageCount: r.message_count,
  }))

  return { visitors }
}
