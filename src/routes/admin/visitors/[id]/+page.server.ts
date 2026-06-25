/**
 * Single-visitor transcript view. Pulls every chat session for the visitor and
 * every message under each session, ordered chronologically.
 */

import { error } from '@sveltejs/kit'
import { asc, eq } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { chatMessages, chatSessions, visitors } from '$lib/server/db/schema'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const id = params.id
  if (!id) throw error(404, 'Not found')

  const [v] = await db.select().from(visitors).where(eq(visitors.id, id)).limit(1)
  if (!v) throw error(404, 'Visitor not found')

  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.visitorId, id))
    .orderBy(asc(chatSessions.startedAt))

  const sessionIds = sessions.map((s) => s.id)
  const messages = sessionIds.length
    ? await Promise.all(
        sessionIds.map((sid) =>
          db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, sid))
            .orderBy(asc(chatMessages.createdAt))
        )
      )
    : []

  const sessionsWithMessages = sessions.map((s, i) => ({
    id: s.id,
    startedAt: s.startedAt.toISOString(),
    lastMessageAt: s.lastMessageAt.toISOString(),
    messages: (messages[i] ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      tokensIn: m.tokensIn,
      tokensOut: m.tokensOut,
    })),
  }))

  return {
    visitor: {
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      verifiedAt: v.verifiedAt ? v.verifiedAt.toISOString() : null,
      firstSeenAt: v.firstSeenAt.toISOString(),
      lastSeenAt: v.lastSeenAt.toISOString(),
    },
    sessions: sessionsWithMessages,
  }
}
