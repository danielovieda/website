/**
 * Admin training chat endpoint.
 *
 * Same shape as /api/chat (streamText → toUIMessageStreamResponse) but uses
 * trainingSystemPrompt and is auth-gated to the admin user via hooks.server.ts.
 *
 * Training turns are NOT persisted into chat_messages — they aren't visitor
 * conversations, and persisting them would pollute the visitor transcripts.
 */

import { error, type RequestHandler } from '@sveltejs/kit'
import { streamText, type UIMessage, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { retrieveContext, formatContextForPrompt } from '$lib/server/rag'
import { trainingSystemPrompt } from '$lib/server/chat-prompts'

const CHAT_MODEL = openai('gpt-4o')

export const POST: RequestHandler = async (event) => {
  // Gate is enforced by hooks.server.ts on /api/admin/*; this is belt-and-suspenders.
  if (!event.locals.user) {
    throw error(401, 'Unauthorized')
  }

  const body = (await event.request.json()) as { messages: UIMessage[] }
  const uiMessages = body.messages ?? []
  const lastUserMessage = [...uiMessages].reverse().find((m) => m.role === 'user')
  const lastUserText = lastUserMessage ? extractText(lastUserMessage) : ''
  if (!lastUserText) throw error(400, 'No user message.')

  // Pull existing context so the model can avoid duplicating Q/A pairs.
  const retrieved = await retrieveContext({ query: lastUserText })
  const contextBlock = formatContextForPrompt(retrieved)
  const system = trainingSystemPrompt({ contextBlock })

  const result = streamText({
    model: CHAT_MODEL,
    system,
    messages: await convertToModelMessages(uiMessages),
    temperature: 0.6,
  })

  return result.toUIMessageStreamResponse()
}

function extractText(m: UIMessage): string {
  if (!m.parts) return ''
  return m.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('\n')
    .trim()
}
