/**
 * Update or delete a single qa_pair. Auth: hooks.server.ts gates /api/admin/*.
 *
 * PATCH re-embeds only when the question text changes.
 */

import { error, json, type RequestHandler } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { qaPairs } from '$lib/server/db/schema'
import { embedOne, toPgVector } from '$lib/server/embeddings'

const Body = z.object({
  question: z.string().trim().min(3).max(2000),
  answer: z.string().trim().min(1).max(8000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
})

export const PATCH: RequestHandler = async ({ params, request }) => {
  const id = params.id
  if (!id) throw error(400, 'Missing id')

  let parsed
  try {
    parsed = Body.parse(await request.json())
  } catch {
    return json({ ok: false, error: 'Invalid input.' }, { status: 400 })
  }

  const [existing] = await db.select().from(qaPairs).where(eq(qaPairs.id, id)).limit(1)
  if (!existing) throw error(404, 'Not found')

  const tags = parsed.tags ?? (existing.tags as string[]) ?? []
  const questionChanged = parsed.question !== existing.question

  if (questionChanged) {
    const embedding = await embedOne(parsed.question)
    await db.execute(sql`
      UPDATE qa_pairs
      SET question  = ${parsed.question},
          answer    = ${parsed.answer},
          tags      = ${JSON.stringify(tags)}::jsonb,
          embedding = ${toPgVector(embedding)}::vector,
          updated_at = now()
      WHERE id = ${id}
    `)
  } else {
    await db
      .update(qaPairs)
      .set({
        answer: parsed.answer,
        tags,
        updatedAt: new Date(),
      })
      .where(eq(qaPairs.id, id))
  }

  return json({ ok: true, reembedded: questionChanged })
}

export const DELETE: RequestHandler = async ({ params }) => {
  const id = params.id
  if (!id) throw error(400, 'Missing id')

  const r = await db.delete(qaPairs).where(eq(qaPairs.id, id))
  if (r.count === 0) throw error(404, 'Not found')

  return json({ ok: true })
}
