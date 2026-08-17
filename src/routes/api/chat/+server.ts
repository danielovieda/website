/**
 * Visitor chat endpoint — streaming RAG.
 *
 * Auth: requires a valid signed visitor_session cookie (set by verify-otp).
 * Persistence: every user + assistant turn is written to chat_messages.
 */

import { error, json, type RequestHandler } from '@sveltejs/kit'
import { streamText, type UIMessage, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { and, count, desc, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '$lib/server/db'
import { chatMessages, chatSessions, visitors } from '$lib/server/db/schema'
import { retrieveContext, formatContextForPrompt } from '$lib/server/rag'
import { visitorSystemPrompt, wrapUserMessage } from '$lib/server/chat-prompts'
import { DEV_VISITOR_ID, ensureDevVisitor } from '$lib/server/dev-bypass'

const CHAT_MODEL = openai('gpt-4o')

const MAX_MESSAGE_CHARS = clampInt(process.env.CHAT_MAX_MESSAGE_CHARS, 2000, 100, 50_000)
const MAX_MESSAGES_PER_VISITOR = clampInt(
  process.env.CHAT_MAX_MESSAGES_PER_VISITOR,
  30,
  1,
  10_000
)

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const n = raw === undefined ? NaN : Number(raw)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.floor(n)))
}

export const POST: RequestHandler = async (event) => {
  const visitorId = event.locals.visitorId
  if (!visitorId) {
    throw error(401, 'Verify your identity to chat.')
  }

  // Dev bypass: lazily upsert the placeholder visitor row so FKs resolve.
  if (visitorId === DEV_VISITOR_ID) {
    await ensureDevVisitor()
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

  // Per-message character cap.
  if (lastUserText.length > MAX_MESSAGE_CHARS) {
    return json(
      {
        ok: false,
        code: 'message_too_long',
        error: `Message too long. Keep it under ${MAX_MESSAGE_CHARS.toLocaleString()} characters.`,
        limit: MAX_MESSAGE_CHARS,
      },
      { status: 413 }
    )
  }

  // Per-visitor lifetime message cap. Dev bypass is exempt so testing isn't gated.
  if (visitorId !== DEV_VISITOR_ID) {
    const [usage] = await db
      .select({ used: count() })
      .from(chatMessages)
      .innerJoin(chatSessions, eq(chatSessions.id, chatMessages.sessionId))
      .where(and(eq(chatSessions.visitorId, visitorId), eq(chatMessages.role, 'user')))
    const used = Number(usage?.used ?? 0)
    if (used >= MAX_MESSAGES_PER_VISITOR) {
      return json(
        {
          ok: false,
          code: 'message_quota_exceeded',
          error: `You've reached the chat limit (${MAX_MESSAGES_PER_VISITOR} messages). Email Daniel directly at ovieda@gmail.com if you'd like to continue.`,
          limit: MAX_MESSAGES_PER_VISITOR,
          used,
        },
        { status: 429 }
      )
    }
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

  const wrappedMessages = uiMessages.map(wrapUserPartsForInjectionDefense)

  const result = streamText({
    model: CHAT_MODEL,
    system,
    messages: await convertToModelMessages(wrappedMessages),
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

/**
 * Wrap text parts of user messages in <user_message> envelopes so the model
 * has structural boundaries between system instructions and untrusted input.
 * Assistant messages pass through untouched.
 */
function wrapUserPartsForInjectionDefense(m: UIMessage): UIMessage {
  if (m.role !== 'user' || !m.parts) return m
  return {
    ...m,
    parts: m.parts.map((p) =>
      p.type === 'text' ? { ...p, text: wrapUserMessage(p.text) } : p
    ),
  }
}

