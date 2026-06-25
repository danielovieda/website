/**
 * Visitor chat endpoint — streaming RAG.
 *
 * Auth: requires a valid signed visitor_session cookie (set by verify-otp).
 * Persistence: every user + assistant turn is written to chat_messages.
 */

import { error, type RequestHandler } from '@sveltejs/kit'
import { streamText, type UIMessage, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { and, desc, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '$lib/server/db'
import { chatMessages, chatSessions, visitors } from '$lib/server/db/schema'
import { retrieveContext, formatContextForPrompt } from '$lib/server/rag'
import { visitorSystemPrompt } from '$lib/server/chat-prompts'

const CHAT_MODEL = openai('gpt-4o')

export const POST: RequestHandler = async (event) => {
  const visitorId = event.locals.visitorId
  if (!visitorId) {
    throw error(401, 'Verify your identity to chat.')
  }

  // Confirm the visitor row still exists and is verified.
  const [v] = await db.select().from(visitors).where(eq(visitors.id, visitorId)).limit(1)
  if (!v || !v.verifiedAt) {
    throw error(401, 'Verify your identity to chat.')
  }

  const body = (await event.request.json()) as { messages: UIMessage[] }
  const uiMessages = body.messages ?? []
  const lastUserMessage = [...uiMessages].reverse().find((m) => m.role === 'user')
  const lastUserText = lastUserMessage ? extractText(lastUserMessage) : ''

  if (!lastUserText) {
    throw error(400, 'No user message.')
  }

  // Find (or create) an active chat session for this visitor.
  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.visitorId, visitorId))
    .orderBy(desc(chatSessions.lastMessageAt))
    .limit(1)
  const sessionId = sessions[0]?.id ?? (await createSession(visitorId))

  // RAG: retrieve context for the latest user query.
  const retrieved = await retrieveContext({ query: lastUserText })
  const contextBlock = formatContextForPrompt(retrieved)
  const system = visitorSystemPrompt({ contextBlock })

  // Persist the user turn.
  await db.insert(chatMessages).values({
    id: randomUUID(),
    sessionId,
    role: 'user',
    content: lastUserText,
  })

  const result = streamText({
    model: CHAT_MODEL,
    system,
    messages: await convertToModelMessages(uiMessages),
    temperature: 0.4,
    onFinish: async ({ text, usage }) => {
      try {
        await db.insert(chatMessages).values({
          id: randomUUID(),
          sessionId,
          role: 'assistant',
          content: text,
          tokensIn: usage?.inputTokens ?? null,
          tokensOut: usage?.outputTokens ?? null,
        })
        await db
          .update(chatSessions)
          .set({ lastMessageAt: new Date() })
          .where(eq(chatSessions.id, sessionId))
        await db
          .update(visitors)
          .set({ lastSeenAt: new Date() })
          .where(eq(visitors.id, visitorId))
      } catch (e) {
        console.error('[chat] persistence failed', e)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}

async function createSession(visitorId: string): Promise<string> {
  const id = randomUUID()
  await db.insert(chatSessions).values({ id, visitorId })
  return id
}

function extractText(m: UIMessage): string {
  if (!m.parts) return ''
  return m.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('\n')
    .trim()
}

// Silence unused warning
void and
