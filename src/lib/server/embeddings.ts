/**
 * Embedding helper — wraps the AI SDK's `embed`/`embedMany` against OpenAI
 * directly. Single model: text-embedding-3-small (1536 dims).
 */

import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

export const EMBEDDING_MODEL = openai.textEmbeddingModel('text-embedding-3-small')
export const EMBEDDING_DIMS = 1536

export async function embedOne(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: text,
  })
  return embedding
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    values: texts,
  })
  return embeddings
}

/** pgvector accepts text input in the form '[0.1, 0.2, ...]'. */
export function toPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}
