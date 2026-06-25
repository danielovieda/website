/**
 * Admin dashboard data — just counts. All counts are cheap COUNT(*) queries;
 * we don't paginate anything here, this page is for at-a-glance vitals.
 */

import { sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [v, qa, rc, cs, cm] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS c FROM visitors`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM qa_pairs`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM resume_chunks`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM chat_sessions`),
    db.execute(sql`SELECT COUNT(*)::int AS c FROM chat_messages`),
  ])

  const pluck = (r: unknown): number => {
    const rows = r as Array<{ c: number }>
    return rows[0]?.c ?? 0
  }

  return {
    counts: {
      visitors: pluck(v),
      qaPairs: pluck(qa),
      resumeChunks: pluck(rc),
      chatSessions: pluck(cs),
      chatMessages: pluck(cm),
    },
  }
}
