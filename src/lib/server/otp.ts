/**
 * OTP issuance and verification.
 *
 * Rate limits:
 *   - max 3 codes per email per hour
 *   - max 5 codes per IP per hour
 *   - max 5 verification attempts per code (incremented on each verify; over → revoke)
 *
 * Code lifetime: 10 minutes.
 * Hash: sha256(code + ':' + BETTER_AUTH_SECRET) — never plaintext at rest.
 */

import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { createHash, randomInt, randomUUID } from 'node:crypto'
import { db } from './db'
import { otpCodes } from './db/schema'

const TEN_MINUTES_MS = 10 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000
const MAX_PER_EMAIL_PER_HOUR = 3
const MAX_PER_IP_PER_HOUR = 5
const MAX_ATTEMPTS = 5

function hashCode(code: string): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-only-insecure-secret'
  return createHash('sha256').update(`${code}:${secret}`).digest('hex')
}

export function generateCode(): string {
  // 6-digit zero-padded
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export interface IssueOtpArgs {
  email: string
  ipAddress: string | null
}

export interface IssueOtpResult {
  ok: boolean
  code?: string
  expiresAt?: Date
  reason?: 'rate_limited_email' | 'rate_limited_ip'
}

export async function issueOtp({ email, ipAddress }: IssueOtpArgs): Promise<IssueOtpResult> {
  const since = new Date(Date.now() - ONE_HOUR_MS)

  // Email rate limit
  const emailCountRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), gt(otpCodes.createdAt, since)))
  const emailCount = emailCountRow[0]?.count ?? 0
  if (emailCount >= MAX_PER_EMAIL_PER_HOUR) {
    return { ok: false, reason: 'rate_limited_email' }
  }

  // IP rate limit (best-effort: skip if IP unknown)
  if (ipAddress) {
    const ipCountRow = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(otpCodes)
      .where(and(eq(otpCodes.ipAddress, ipAddress), gt(otpCodes.createdAt, since)))
    const ipCount = ipCountRow[0]?.count ?? 0
    if (ipCount >= MAX_PER_IP_PER_HOUR) {
      return { ok: false, reason: 'rate_limited_ip' }
    }
  }

  const code = generateCode()
  const codeHash = hashCode(code)
  const expiresAt = new Date(Date.now() + TEN_MINUTES_MS)

  await db.insert(otpCodes).values({
    id: randomUUID(),
    email,
    codeHash,
    expiresAt,
    ipAddress,
  })

  return { ok: true, code, expiresAt }
}

export interface VerifyOtpResult {
  ok: boolean
  reason?: 'no_code' | 'expired' | 'invalid' | 'too_many_attempts'
}

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
  // Find the most recent unconsumed code for this email.
  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), isNull(otpCodes.consumedAt)))
    .orderBy(sql`${otpCodes.createdAt} DESC`)
    .limit(1)
  const row = rows[0]
  if (!row) return { ok: false, reason: 'no_code' }

  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' }
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: 'expired' }
  }

  const candidate = hashCode(code)
  if (candidate !== row.codeHash) {
    await db
      .update(otpCodes)
      .set({ attempts: row.attempts + 1 })
      .where(eq(otpCodes.id, row.id))
    return { ok: false, reason: 'invalid' }
  }

  // Mark consumed.
  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(otpCodes.id, row.id))

  return { ok: true }
}
