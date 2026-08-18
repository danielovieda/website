/**
 * Signed per-day tokens for the Japanese feedback survey.
 *
 * Format: `<dayN>.<hmac>` where hmac = first 32 hex chars of
 * HMAC-SHA256("jp:<dayN>", JP_LINK_SECRET).
 *
 * Deliberately NOT signed with BETTER_AUTH_SECRET, even though that key is
 * right there. Two reasons. Sharing it would mean whatever mints links holds
 * the key that signs admin sessions and visitor cookies — far too much
 * authority for a vocabulary emailer. And rotating BETTER_AUTH_SECRET is a
 * routine act that should only log Daniel out; if links hung off it, every
 * already-sent email would 404 with no clue why. Separate secrets, separate
 * blast radii.
 *
 * Why a token rather than the admin gate: the survey link is tapped from a
 * phone at breakfast, and anything that can present a login form will get
 * skipped, which kills the data the schedule depends on. The token carries no
 * PII, grants nothing but the ability to grade one Japanese word, and cannot
 * be guessed — the same HMAC construction the visitor cookie already uses.
 *
 * 128 bits of signature is far more than this needs; it keeps the URL short
 * enough to sit on one line of a plain-text email.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

const SIG_CHARS = 32

/** Throws rather than falling back to a default — an unset secret must never
 *  silently produce forgeable links. */
function secret(): string {
  const s = process.env.JP_LINK_SECRET
  if (!s) throw new Error('JP_LINK_SECRET is required to sign or verify study links')
  return s
}

function signature(dayN: number): string {
  return createHmac('sha256', secret()).update(`jp:${dayN}`).digest('hex').slice(0, SIG_CHARS)
}

export function signDayToken(dayN: number): string {
  return `${dayN}.${signature(dayN)}`
}

/** Returns the dayN encoded in the token, or null if it is malformed or forged. */
export function verifyDayToken(token: string): number | null {
  const idx = token.lastIndexOf('.')
  if (idx <= 0) return null

  const dayPart = token.slice(0, idx)
  const sig = token.slice(idx + 1)

  // Both halves must be canonical BEFORE any decoding.
  //
  // Buffer.from(x, 'hex') silently stops at the first non-hex character and
  // drops a trailing odd nibble, so without these tests "12.<sig>ZZZZZZ" and
  // "0000012.<sig>" both verified as day 12. That was never a forgery — a
  // valid signature for that exact day was still required — but it meant
  // unbounded distinct strings mapped to one day, which quietly defeats any
  // future rate limit, dedupe or log correlation keyed on the token.
  if (!/^[1-9]\d*$/.test(dayPart)) return null
  if (!new RegExp(`^[0-9a-f]{${SIG_CHARS}}$`).test(sig)) return null

  const dayN = Number(dayPart)
  if (!Number.isSafeInteger(dayN) || dayN < 1) return null

  try {
    const a = Buffer.from(sig, 'hex')
    // secret() throws when unset; caught below, so an unconfigured deployment
    // rejects every token instead of accepting anything.
    const b = Buffer.from(signature(dayN), 'hex')
    if (a.length !== b.length || a.length === 0) return null
    if (!timingSafeEqual(a, b)) return null
    return dayN
  } catch {
    return null
  }
}
