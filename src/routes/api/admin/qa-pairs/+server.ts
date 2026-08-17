/**
 * Insert a curated Q/A pair into qa_pairs. Embedding is computed from the
 * question text — visitor RAG retrieves by question similarity, then injects
 * "Q: …\nA: …" into the prompt context.
 *
 * Auth: hooks.server.ts gates /api/admin/* to the admin user.
 */

import { json, type RequestHandler } from '@sveltejs/kit'
import { desc, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db } from '$lib/server/db'
import { qaPairs } from '$lib/server/db/schema'
import { embedOne, toPgVector } from '$lib/server/embeddings'

const Body = z.object({
  question: z.string().trim().min(3).max(2000),
  answer: z.string().trim().min(1).max(8000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
})

export const GET: RequestHandler = async () => {
  const rows = await db
    .select({
      id: qaPairs.id,
      question: qaPairs.question,
      answer: qaPairs.answer,
      tags: qaPairs.tags,
      createdAt: qaPairs.createdAt,
      updatedAt: qaPairs.updatedAt,
    })
    .from(qaPairs)
    .orderBy(desc(qaPairs.updatedAt))
  return json({ ok: true, pairs: rows })
}

export const POST: RequestHandler = async ({ request }) => {
  let parsed
  try {
    parsed = Body.parse(await request.json())
  } catch {
    return json({ ok: false, error: 'Invalid input.' }, { status: 400 })
  }

  const embedding = await embedOne(parsed.question)
  const id = randomUUID()
  const tags = parsed.tags ?? []

  await db.execute(sql`
    INSERT INTO qa_pairs (id, question, answer, embedding, tags)
    VALUES (
      ${id},
      ${parsed.question},
      ${parsed.answer},
      ${toPgVector(embedding)}::vector,
      ${JSON.stringify(tags)}::jsonb
    )
  `)

  return json({ ok: true, id })
}
