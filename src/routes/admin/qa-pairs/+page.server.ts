import { desc } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { qaPairs } from '$lib/server/db/schema'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
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

  return {
    pairs: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      tags: (r.tags as string[]) ?? [],
    })),
  }
}
