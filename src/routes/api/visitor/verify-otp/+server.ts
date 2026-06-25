import { json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'
import { verifyOtp } from '$lib/server/otp'
import { startChatSession, upsertVerifiedVisitor } from '$lib/server/visitors'
import { setVisitorCookie } from '$lib/server/visitor-session'

const Body = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).toLowerCase(),
  phone: z.string().trim().min(7).max(32),
  code: z.string().trim().regex(/^\d{6}$/),
})

export const POST: RequestHandler = async (event) => {
  let parsed
  try {
    parsed = Body.parse(await event.request.json())
  } catch {
    return json({ ok: false, error: 'Invalid input' }, { status: 400 })
  }

  const result = await verifyOtp(parsed.email, parsed.code)
  if (!result.ok) {
    const msg =
      result.reason === 'expired'
        ? 'Code expired. Request a new one.'
        : result.reason === 'too_many_attempts'
        ? 'Too many attempts. Request a new code.'
        : 'Invalid code.'
    return json({ ok: false, error: msg }, { status: 400 })
  }

  const visitor = await upsertVerifiedVisitor({
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
  })
  const sessionId = await startChatSession(visitor.id)
  setVisitorCookie(event, visitor.id)

  return json({ ok: true, sessionId })
}
