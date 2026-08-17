/**
 * Dev-only chat bypass.
 *
 * When `DEV_CHAT_BYPASS=true` is set in the environment, the visitor cookie
 * gate is bypassed: `hooks.server.ts` sets `locals.visitorId` to a fixed
 * sentinel id, and `/api/chat` lazily upserts a "Dev Bypass" row so foreign
 * keys remain valid. Visitor conversations during dev still persist to
 * `chat_messages`, scoped to that one row, so they're inspectable via
 * `/admin/visitors`.
 *
 * Never enable this in production. The flag is a hard string match; any value
 * other than the literal "true" leaves the gate intact.
 */

import { eq } from 'drizzle-orm'
import { db } from './db'
import { visitors } from './db/schema'

export const DEV_VISITOR_ID = 'dev-bypass-visitor'

export function isDevBypassEnabled(): boolean {
  return process.env.DEV_CHAT_BYPASS === 'true'
}

let ensured = false

export async function ensureDevVisitor(): Promise<void> {
  if (ensured) return
  const [existing] = await db
    .select({ id: visitors.id })
    .from(visitors)
    .where(eq(visitors.id, DEV_VISITOR_ID))
    .limit(1)
  if (!existing) {
    await db.insert(visitors).values({
      id: DEV_VISITOR_ID,
      name: 'Dev Bypass',
      email: 'dev@local',
      phone: 'dev',
      verifiedAt: new Date(),
    })
  }
  ensured = true
}
