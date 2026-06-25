import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from './db'
import { chatSessions, visitors, type Visitor } from './db/schema'

export interface UpsertVisitorArgs {
  name: string
  email: string
  phone: string
}

/**
 * Upsert a visitor by email. Updates contact info on revisit, sets verifiedAt
 * to now, and returns the row.
 */
export async function upsertVerifiedVisitor(args: UpsertVisitorArgs): Promise<Visitor> {
  const existing = await db
    .select()
    .from(visitors)
    .where(eq(visitors.email, args.email))
    .limit(1)
  const now = new Date()

  if (existing[0]) {
    const v = existing[0]
    await db
      .update(visitors)
      .set({
        name: args.name,
        phone: args.phone,
        verifiedAt: v.verifiedAt ?? now,
        lastSeenAt: now,
      })
      .where(eq(visitors.id, v.id))
    return { ...v, name: args.name, phone: args.phone, verifiedAt: v.verifiedAt ?? now, lastSeenAt: now }
  }

  const id = randomUUID()
  await db.insert(visitors).values({
    id,
    name: args.name,
    email: args.email,
    phone: args.phone,
    verifiedAt: now,
    firstSeenAt: now,
    lastSeenAt: now,
  })
  return {
    id,
    name: args.name,
    email: args.email,
    phone: args.phone,
    verifiedAt: now,
    firstSeenAt: now,
    lastSeenAt: now,
  }
}

/** Start a new chat session for a visitor. Returns the session id. */
export async function startChatSession(visitorId: string): Promise<string> {
  const id = randomUUID()
  await db.insert(chatSessions).values({ id, visitorId })
  return id
}
