import { json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'
import { issueOtp } from '$lib/server/otp'
import { sendOtpEmail } from '$lib/server/email'

const Body = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).toLowerCase(),
  phone: z.string().trim().min(7).max(32),
})

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  let parsed
  try {
    parsed = Body.parse(await request.json())
  } catch {
    return json({ ok: false, error: 'Invalid input' }, { status: 400 })
  }

  const ip = (() => {
    try {
      return getClientAddress()
    } catch {
      return null
    }
  })()

  const result = await issueOtp({ email: parsed.email, ipAddress: ip })
  if (!result.ok) {
    const status = result.reason === 'rate_limited_email' || result.reason === 'rate_limited_ip' ? 429 : 400
    return json({ ok: false, error: 'Rate limited. Try again later.' }, { status })
  }

  try {
    await sendOtpEmail({ to: parsed.email, code: result.code!, visitorName: parsed.name })
  } catch (err) {
    console.error('[otp] Resend send failed:', err)
    // Return ok anyway — code is in the DB; in dev we logged it to stdout.
  }

  return json({ ok: true })
}
