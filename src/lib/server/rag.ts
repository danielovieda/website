/**
 * RAG retrieval for visitor chat.
 *
 * Two corpora:
 *   - qa_pairs: admin-curated answers (weighted higher, retrieved first)
 *   - resume_chunks: raw resume content from master.yaml
 *
 * Strategy: embed the query once, take top-K from each table by cosine
 * similarity (1 - distance), interleave with qa_pairs preferred.
 */

import { sql } from 'drizzle-orm'
import { db } from './db'
import { embedOne, toPgVector } from './embeddings'

export interface Retrieved {
  kind: 'qa' | 'resume'
  content: string
  score: number
  source?: string
  metadata?: Record<string, unknown>
}

export interface RetrieveArgs {
  query: string
  resumeTopK?: number
  qaTopK?: number
}

export async function retrieveContext({
  query,
  resumeTopK = 6,
  qaTopK = 4,
}: RetrieveArgs): Promise<Retrieved[]> {
  const embedding = await embedOne(query)
  const vec = toPgVector(embedding)

  const [qaRows, resumeRows] = await Promise.all([
    db.execute(sql`
      SELECT question, answer, tags, 1 - (embedding <=> ${vec}::vector) AS score
      FROM qa_pairs
      ORDER BY embedding <=> ${vec}::vector
      LIMIT ${qaTopK}
    `),
    db.execute(sql`
      SELECT source, content, metadata, 1 - (embedding <=> ${vec}::vector) AS score
      FROM resume_chunks
      ORDER BY embedding <=> ${vec}::vector
      LIMIT ${resumeTopK}
    `),
  ])

  const qa: Retrieved[] = (qaRows as Array<Record<string, unknown>>).map((r) => ({
    kind: 'qa',
    content: `Q: ${r.question}\nA: ${r.answer}`,
    score: Number(r.score) + 0.05, // slight boost — admin-curated answers preferred
    metadata: { tags: r.tags },
  }))

  const resume: Retrieved[] = (resumeRows as Array<Record<string, unknown>>).map((r) => ({
    kind: 'resume',
    content: String(r.content),
    score: Number(r.score),
    source: String(r.source),
    metadata: r.metadata as Record<string, unknown>,
  }))

  // Keep qa_pairs contiguous at the top: a flat score-sort can interleave
  // resume prose between our best voice examples, weakening in-context style
  // transfer. qa items get preferred position; each group sorted internally.
  const qaSorted = qa.sort((a, b) => b.score - a.score)
  const resumeSorted = resume.sort((a, b) => b.score - a.score)
  return [...qaSorted, ...resumeSorted]
}

export function formatContextForPrompt(retrieved: Retrieved[]): string {
  if (retrieved.length === 0) {
    return '<context_item>No relevant context found in resume or trained Q/A.</context_item>'
  }
  return retrieved
    .map(
      (r, i) =>
        `<context_item index="${i + 1}" kind="${r.kind}">\n${r.content}\n</context_item>`
    )
    .join('\n')
}
