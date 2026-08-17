/**
 * Apply all SQL files in drizzle/ in lexical order against DATABASE_URL.
 * Idempotent — every statement uses IF NOT EXISTS / CREATE OR REPLACE.
 */

import 'dotenv/config'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const dir = resolve(process.cwd(), 'drizzle')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.log('No migrations found in drizzle/')
  process.exit(0)
}

const sql = postgres(url, { prepare: false, max: 1 })

try {
  for (const file of files) {
    const path = resolve(dir, file)
    const body = readFileSync(path, 'utf8')
    console.log(`→ applying ${file}`)
    await sql.unsafe(body)
  }
  console.log(`✔ applied ${files.length} migration(s)`)
} catch (err) {
  console.error('✗ migration failed:', err)
  process.exitCode = 1
} finally {
  await sql.end()
}
