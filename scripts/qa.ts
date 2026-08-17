/**
 * Direct CLI for managing qa_pairs without going through the website.
 *
 * Usage:
 *   pnpm qa add -- "question" "answer" [tag1,tag2,...]
 *   pnpm qa add-json -- '{"question":"...","answer":"...","tags":["..."]}'
 *   pnpm qa list [--limit 20]
 *   pnpm qa search "query text" [--limit 5]
 *   pnpm qa delete <id>
 *
 * Reads DATABASE_URL + OPENAI_API_KEY from .env.
 */

import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!DATABASE_URL) die('DATABASE_URL is required')
if (!OPENAI_API_KEY) die('OPENAI_API_KEY is required')

const sql = postgres(DATABASE_URL, { prepare: false, max: 1 })

const [, , cmd, ...rawRest] = process.argv
// pnpm forwards the literal "--" separator into argv. Drop the first occurrence.
const dashIdx = rawRest.indexOf('--')
const rest = dashIdx === -1 ? rawRest : [...rawRest.slice(0, dashIdx), ...rawRest.slice(dashIdx + 1)]

try {
  switch (cmd) {
    case 'add':
      await add(rest)
      break
    case 'add-json':
      await addJson(rest.join(' '))
      break
    case 'add-file':
      await addFile(rest[0])
      break
    case 'list':
      await list(rest)
      break
    case 'search':
      await search(rest)
      break
    case 'delete':
      await del(rest[0])
      break
    default:
      printHelp()
      process.exitCode = 1
  }
} catch (err) {
  console.error('✗', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await sql.end()
}

// ---------- commands --------------------------------------------------------

async function add(args: string[]): Promise<void> {
  const [question, answer, tagsCsv] = args
  if (!question || !answer) die('usage: pnpm qa add -- "question" "answer" [tag1,tag2]')
  const tags = tagsCsv ? tagsCsv.split(',').map((t) => t.trim()).filter(Boolean) : []
  await insertPair({ question, answer, tags })
}

async function addJson(json: string): Promise<void> {
  if (!json) die('usage: pnpm qa add-json -- \'{"question":"...","answer":"..."}\'')
  let parsed: { question?: string; answer?: string; tags?: string[] }
  try {
    parsed = JSON.parse(json)
  } catch {
    die('invalid JSON')
  }
  if (!parsed!.question || !parsed!.answer) die('json must include question + answer')
  await insertPair({
    question: parsed!.question,
    answer: parsed!.answer,
    tags: parsed!.tags ?? [],
  })
}

async function addFile(path: string): Promise<void> {
  if (!path) die('usage: pnpm qa add-file <path-to-json>')
  const body = readFileSync(path, 'utf8')
  await addJson(body)
}

async function list(args: string[]): Promise<void> {
  const limit = numFlag(args, '--limit', 20)
  const rows = await sql<Array<{ id: string; question: string; answer: string; tags: string[]; created_at: Date }>>`
    SELECT id, question, answer, tags, created_at
    FROM qa_pairs
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  if (rows.length === 0) {
    console.log('(no qa_pairs yet)')
    return
  }
  for (const r of rows) {
    console.log(`\n[${r.id.slice(0, 8)}] ${fmtDate(r.created_at)}  tags=${JSON.stringify(r.tags)}`)
    console.log(`  Q: ${r.question}`)
    console.log(`  A: ${truncate(r.answer, 240)}`)
  }
  console.log(`\n${rows.length} pair(s).`)
}

async function search(args: string[]): Promise<void> {
  const limit = numFlag(args, '--limit', 5)
  const query = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--limit').join(' ')
  if (!query) die('usage: pnpm qa search "query text" [--limit 5]')
  const embedding = await embed(query)
  const vec = toPgVector(embedding)
  const rows = await sql<Array<{ id: string; question: string; answer: string; score: number }>>`
    SELECT id, question, answer, 1 - (embedding <=> ${vec}::vector) AS score
    FROM qa_pairs
    ORDER BY embedding <=> ${vec}::vector
    LIMIT ${limit}
  `
  if (rows.length === 0) {
    console.log('(no matches)')
    return
  }
  for (const r of rows) {
    console.log(`\n[${r.id.slice(0, 8)}] score=${Number(r.score).toFixed(3)}`)
    console.log(`  Q: ${r.question}`)
    console.log(`  A: ${truncate(r.answer, 240)}`)
  }
}

async function del(idPrefix: string): Promise<void> {
  if (!idPrefix) die('usage: pnpm qa delete <id-or-prefix>')
  const rows = await sql<Array<{ id: string; question: string }>>`
    SELECT id, question FROM qa_pairs WHERE id LIKE ${idPrefix + '%'}
  `
  if (rows.length === 0) die(`no qa_pair found matching "${idPrefix}"`)
  if (rows.length > 1) die(`${rows.length} pairs match "${idPrefix}" — be more specific`)
  await sql`DELETE FROM qa_pairs WHERE id = ${rows[0].id}`
  console.log(`✔ deleted [${rows[0].id.slice(0, 8)}] Q: ${rows[0].question}`)
}

// ---------- helpers ---------------------------------------------------------

async function insertPair(args: { question: string; answer: string; tags: string[] }): Promise<void> {
  const embedding = await embed(args.question)
  const id = randomUUID()
  await sql`
    INSERT INTO qa_pairs (id, question, answer, embedding, tags)
    VALUES (
      ${id},
      ${args.question},
      ${args.answer},
      ${toPgVector(embedding)}::vector,
      ${JSON.stringify(args.tags)}::jsonb
    )
  `
  console.log(`✔ saved [${id.slice(0, 8)}]`)
  console.log(`  Q: ${args.question}`)
  console.log(`  A: ${truncate(args.answer, 200)}`)
  if (args.tags.length) console.log(`  tags: ${args.tags.join(', ')}`)
}

async function embed(text: string): Promise<number[]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })
  if (!r.ok) throw new Error(`openai embed failed (${r.status}): ${await r.text()}`)
  const json = (await r.json()) as { data: Array<{ embedding: number[] }> }
  return json.data[0].embedding
}

function toPgVector(v: number[]): string {
  return `[${v.join(',')}]`
}

function numFlag(args: string[], name: string, fallback: number): number {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  const n = Number(args[i + 1])
  return Number.isFinite(n) ? n : fallback
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}

function fmtDate(d: Date): string {
  return new Date(d).toISOString().replace('T', ' ').slice(0, 16)
}

function die(msg: string): never {
  console.error(msg)
  process.exit(1)
}

function printHelp(): void {
  console.log(`pnpm qa <command>

  add -- "question" "answer" [tag1,tag2]      Save a Q/A pair (embeds the question).
  add-json -- '{"question":"...","answer":"...","tags":["..."]}'
  add-file <path>                             Same as add-json but reads from a file (avoids shell quoting).
  list [--limit 20]                           Show recent pairs.
  search "query" [--limit 5]                  Cosine search over saved pairs.
  delete <id-or-prefix>                       Remove a pair.`)
}
