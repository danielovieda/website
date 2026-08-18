/**
 * Bearer-token guard for the two machine endpoints under /api/jp.
 *
 * These are called by the house machine, not by a browser, so there is no
 * session to lean on. JP_API_TOKEN is a shared secret held in Vercel's env and
 * in the house machine's secrets file.
 *
 * The expected value is trimmed: a trailing newline in the secrets file at
 * either end would otherwise fail closed with no diagnostic at all.
 */

import { createHash, timingSafeEqual } from 'node:crypto'

export function isAuthorized(request: Request): boolean {
  const expected = process.env.JP_API_TOKEN
  // Fail closed: an unset token means the endpoints are unusable, never open.
  if (!expected) return false

  const header = request.headers.get('authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  const presented = match?.[1]
  if (!presented) return false

  // Hash both sides first so the comparison is over fixed-width buffers and
  // an early length check cannot leak the secret's length.
  const a = createHash('sha256').update(presented).digest()
  const b = createHash('sha256').update(expected.trim()).digest()
  return timingSafeEqual(a, b)
}
