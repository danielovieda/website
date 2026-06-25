/**
 * Resend email wrapper. Falls back to console logging in dev when no API key is
 * present — keeps the OTP flow testable without network access.
 */

import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? "Daniel's AI <noreply@danielovieda.com>"

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export interface SendOtpEmailArgs {
  to: string
  code: string
  visitorName: string
}

export async function sendOtpEmail({ to, code, visitorName }: SendOtpEmailArgs): Promise<void> {
  const subject = `Your code to chat with Daniel's AI: ${code}`
  const text =
    `Hi ${visitorName || 'there'},\n\n` +
    `Your verification code is: ${code}\n\n` +
    `Enter this code on the site to unlock the chat. The code expires in 10 minutes.\n\n` +
    `If you didn't request this, you can ignore this email.\n\n` +
    `— Daniel`
  const html = `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f1318;max-width:560px;margin:0 auto;padding:24px;">
<p>Hi ${escapeHtml(visitorName || 'there')},</p>
<p>Your verification code is:</p>
<p style="font-size:32px;font-weight:600;letter-spacing:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(code)}</p>
<p>Enter this code on the site to unlock the chat. The code expires in 10 minutes.</p>
<p style="color:#586474;font-size:13px;">If you didn't request this, you can ignore this email.</p>
<p>— Daniel</p>
</body></html>`

  const r = client()
  if (!r) {
    console.log(`[email] No RESEND_API_KEY — would have sent OTP ${code} to ${to}`)
    return
  }
  await r.emails.send({ from: FROM, to, subject, text, html })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
