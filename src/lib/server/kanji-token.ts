/**
 * Signed link for the kanji practice app.
 *
 * Format: `<rotation>.<hmac>` where hmac = first 32 hex chars of
 * HMAC-SHA256("kanji:<rotation>", JP_LINK_SECRET).
 *
 * WHY THIS EXISTS RATHER THAN REUSING THE WORK TOKEN. /kanji originally sat
 * behind the work link, which was fine while nothing linked to it. The moment
 * the daily Japanese lesson links to it, that breaks: the lesson's survey link
 * goes out in every email, so anyone holding one would be handed a token that
 * also opens the work task list. Capabilities have to flow the other way.
 *
 * Signed with JP_LINK_SECRET, the same key as the lesson survey, because both
 * are Japanese-study surfaces of equal sensitivity — a leaked kanji link
 * exposes a list of characters. It is deliberately NOT WORK_LINK_SECRET.
 *
 * The rotation counter works exactly as work-token.ts's does: bump
 * JP_LINK_ROTATION and every kanji link already emailed dies.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

const SIG_CHARS = 32

function secret(): string {
  const s = process.env.JP_LINK_SECRET
  if (!s) throw new Error('JP_LINK_SECRET is required to sign or verify kanji links')
  return s
}

function rotation(): number {
  const raw = (process.env.JP_LINK_ROTATION || '1').trim()
  const n = Number(raw)
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new Error(`JP_LINK_ROTATION must be a positive integer, got "${raw}"`)
  }
  return n
}

function signature(rot: number): string {
  return createHmac('sha256', secret()).update(`kanji:${rot}`).digest('hex').slice(0, SIG_CHARS)
}

export function signKanjiToken(): string {
  const rot = rotation()
  return `${rot}.${signature(rot)}`
}

export function verifyKanjiToken(token: string): boolean {
  const idx = token.lastIndexOf('.')
  if (idx <= 0) return false

  const rotPart = token.slice(0, idx)
  const sig = token.slice(idx + 1)

  // Canonical before decoding — Buffer.from(x, 'hex') stops at the first
  // non-hex character and drops a trailing odd nibble, so without these many
  // distinct strings map to one valid token. Same note as jp-token.ts, where
  // it was a real bug.
  if (!/^[1-9]\d*$/.test(rotPart)) return false
  if (!new RegExp(`^[0-9a-f]{${SIG_CHARS}}$`).test(sig)) return false

  try {
    const current = rotation()
    if (Number(rotPart) !== current) return false
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(signature(current), 'hex')
    if (a.length !== b.length || a.length === 0) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
