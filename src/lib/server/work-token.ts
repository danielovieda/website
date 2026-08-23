/**
 * Signed link for the work checklist.
 *
 * Format: `<rotation>.<hmac>` where hmac = first 32 hex chars of
 * HMAC-SHA256("work:<rotation>", WORK_LINK_SECRET).
 *
 * Same construction and the same reasoning as jp-token.ts — a separate secret
 * from BETTER_AUTH_SECRET so a vocabulary emailer and a task list never hold
 * the key that signs admin sessions, and so rotating one does not silently
 * break the other.
 *
 * THE ROTATION COUNTER IS THE POINT OF THE DIFFERENCE. The Japanese token
 * covers one day and ages out on its own; this link covers the whole task
 * list forever and lives in every reminder email ever sent. If it leaks —
 * a forwarded mail, a shoulder-glance, a phone handed to someone — there has
 * to be a way to kill it that does not mean rotating a secret shared with
 * anything else. Bump WORK_LINK_ROTATION and every previously issued link
 * dies; the next reminder carries the new one.
 *
 * This is a capability, not a login: whoever holds it can read and edit the
 * work list. That was chosen deliberately over better-auth because a login
 * form on a phone at 5am does not get filled in. It is the reason the
 * rotation counter exists.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

const SIG_CHARS = 32

function secret(): string {
  const s = process.env.WORK_LINK_SECRET
  if (!s) throw new Error('WORK_LINK_SECRET is required to sign or verify work links')
  return s
}

/** Defaults to 1 so a deployment that never sets it still works. */
function rotation(): number {
  const raw = (process.env.WORK_LINK_ROTATION || '1').trim()
  const n = Number(raw)
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new Error(`WORK_LINK_ROTATION must be a positive integer, got "${raw}"`)
  }
  return n
}

function signature(rot: number): string {
  return createHmac('sha256', secret()).update(`work:${rot}`).digest('hex').slice(0, SIG_CHARS)
}

export function signWorkToken(): string {
  const rot = rotation()
  return `${rot}.${signature(rot)}`
}

/**
 * True only for a token signed with the CURRENT rotation. An older rotation
 * carries a valid signature for its own number and is still rejected — that
 * is what makes bumping the counter actually revoke anything.
 */
export function verifyWorkToken(token: string): boolean {
  const idx = token.lastIndexOf('.')
  if (idx <= 0) return false

  const rotPart = token.slice(0, idx)
  const sig = token.slice(idx + 1)

  // Both halves canonical before any decoding — Buffer.from(x, 'hex') stops at
  // the first non-hex character and drops a trailing odd nibble, so without
  // these tests many distinct strings map to one valid token. See the same
  // note in jp-token.ts, where it was a real bug.
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
    // secret() or rotation() throwing means the deployment is misconfigured;
    // reject everything rather than accept anything.
    return false
  }
}
