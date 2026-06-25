/**
 * Visitor session cookie — small, signed, server-set.
 *
 * Format: `<visitorId>.<hmac>` where hmac = HMAC-SHA256(visitorId, secret).
 * Verified server-side on every request via hooks.server.ts.
 *
 * Lifetime: 30 days. Refreshed on every chat interaction (lastSeenAt).
 *
 * No PII in the cookie itself — just the visitor row id. The PII (name, email,
 * phone) stays in the visitors table and is only revealed in admin routes.
 */

import type { RequestEvent } from '@sveltejs/kit'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'do-visitor'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function secret(): string {
  return process.env.BETTER_AUTH_SECRET || 'dev-only-insecure-secret-replace-me'
}

function sign(visitorId: string): string {
  const h = createHmac('sha256', secret()).update(visitorId).digest('hex')
  return `${visitorId}.${h}`
}

function verify(value: string): string | null {
  const idx = value.lastIndexOf('.')
  if (idx <= 0) return null
  const visitorId = value.slice(0, idx)
  const sig = value.slice(idx + 1)
  const expected = createHmac('sha256', secret()).update(visitorId).digest('hex')
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null
    return visitorId
  } catch {
    return null
  }
}

export function setVisitorCookie(event: RequestEvent, visitorId: string): void {
  const value = sign(visitorId)
  event.cookies.set(COOKIE_NAME, value, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_SECONDS,
  })
}

export function clearVisitorCookie(event: RequestEvent): void {
  event.cookies.delete(COOKIE_NAME, { path: '/' })
}

export function readVisitorIdFromCookie(event: RequestEvent): string | null {
  const raw = event.cookies.get(COOKIE_NAME)
  if (!raw) return null
  return verify(raw)
}
