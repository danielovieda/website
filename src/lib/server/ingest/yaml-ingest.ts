/**
 * YAML ingest pipeline.
 *
 * Reads data/master.yaml, chunks it, embeds each chunk via OpenAI, and
 * upserts into resume_chunks keyed by the chunk's `source` path. Sources that
 * no longer exist in the YAML are deleted, so the table mirrors current content.
 *
 * Idempotent: running it twice with no YAML changes is a no-op (other than
 * timestamps).
 *
 * Usage:
 *   - via `pnpm ingest` (CLI, tsx)
 *   - via /admin/ingest button (calls runIngest from a server endpoint)
 */

import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '../db'
import { resumeChunks } from '../db/schema'
import { embedBatch, toPgVector } from '../embeddings'
import { chunkResume, loadResume, clearResumeCache } from '../resume'

export interface IngestResult {
  totalChunks: number
  inserted: number
  updated: number
  deleted: number
  durationMs: number
}

export async function runIngest(): Promise<IngestResult> {
  const start = Date.now()
  clearResumeCache()
  const resume = loadResume()
  const chunks = chunkResume(resume)

  if (chunks.length === 0) {
    return { totalChunks: 0, inserted: 0, updated: 0, deleted: 0, durationMs: Date.now() - start }
  }

  // Embed all chunks in batches. text-embedding-3-small supports large batches;
  // we keep it simple at 64 per call.
  const BATCH_SIZE = 64
  const embeddings: number[][] = []
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE).map((c) => c.content)
    const vectors = await embedBatch(batch)
    embeddings.push(...vectors)
  }

  // Read current sources so we can compute inserted/updated/deleted counts.
  const existing = await db
    .select({ source: resumeChunks.source })
    .from(resumeChunks)
  const existingSet = new Set(existing.map((r) => r.source))
  const incomingSet = new Set(chunks.map((c) => c.source))

  let inserted = 0
  let updated = 0

  // Upsert by source.
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!
    const embedding = embeddings[i]!
    const isUpdate = existingSet.has(chunk.source)
    if (isUpdate) {
      await db.execute(sql`
        UPDATE resume_chunks
        SET content = ${chunk.content},
            embedding = ${toPgVector(embedding)}::vector,
            metadata = ${JSON.stringify(chunk.metadata)}::jsonb
        WHERE source = ${chunk.source}
      `)
      updated++
    } else {
      await db.execute(sql`
        INSERT INTO resume_chunks (id, source, content, embedding, metadata)
        VALUES (
          ${randomUUID()},
          ${chunk.source},
          ${chunk.content},
          ${toPgVector(embedding)}::vector,
          ${JSON.stringify(chunk.metadata)}::jsonb
        )
      `)
      inserted++
    }
  }

  // Delete stale sources (rows whose source path no longer exists in the YAML).
  const toDelete = [...existingSet].filter((s) => !incomingSet.has(s))
  let deleted = 0
  if (toDelete.length > 0) {
    for (const source of toDelete) {
      await db.execute(sql`DELETE FROM resume_chunks WHERE source = ${source}`)
      deleted++
    }
  }

  return {
    totalChunks: chunks.length,
    inserted,
    updated,
    deleted,
    durationMs: Date.now() - start,
  }
}

// CLI entrypoint.
const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('/yaml-ingest.ts')
if (isMain) {
  runIngest()
    .then((r) => {
      console.log('Ingest complete:', r)
      process.exit(0)
    })
    .catch((e) => {
      console.error('Ingest failed:', e)
      process.exit(1)
    })
}
