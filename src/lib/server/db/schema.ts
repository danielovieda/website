/**
 * Drizzle schema for danielovieda.com.
 *
 * Tables:
 *   - better-auth: user, session, account, verification (managed by better-auth's Drizzle adapter)
 *   - resume_chunks: RAG corpus from data/master.yaml
 *   - qa_pairs: admin-trained Q/A pairs (RAG, weighted higher)
 *   - visitors: identity-verified visitors who unlocked chat
 *   - otp_codes: 6-digit codes for visitor verification
 *   - chat_sessions / chat_messages: visitor conversation logs
 *
 * Conventions:
 *   - timestamps in `timestamp with time zone`
 *   - all primary keys are text uuids (crypto.randomUUID at insert time)
 *   - embedding columns use pgvector (1536 dims for openai/text-embedding-3-small)
 *   - HNSW indexes on vector columns (created in initial migration SQL)
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from 'drizzle-orm/pg-core'

// ---------- better-auth tables ------------------------------------------------
// Names and columns chosen to match better-auth's default Drizzle schema.
// If you regenerate via `npx @better-auth/cli generate`, keep these aligned.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------- RAG corpus --------------------------------------------------------

export const resumeChunks = pgTable(
  'resume_chunks',
  {
    id: text('id').primaryKey(),
    // Path-like key back to master.yaml so re-ingest is idempotent.
    // e.g. "yaml:experience[2].highlights[5]" or "yaml:summary"
    source: text('source').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sourceIdx: uniqueIndex('resume_chunks_source_idx').on(table.source),
    // HNSW index created in initial SQL migration (drizzle-kit's index DSL doesn't
    // yet support pgvector index opclasses cleanly).
  })
)

export const qaPairs = pgTable(
  'qa_pairs',
  {
    id: text('id').primaryKey(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    // Embedded on the question text (we retrieve by question similarity).
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    tags: jsonb('tags').notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // HNSW index in SQL.
    createdIdx: index('qa_pairs_created_idx').on(table.createdAt),
  })
)

// ---------- Visitors & OTP ----------------------------------------------------

export const visitors = pgTable(
  'visitors',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('visitors_email_idx').on(table.email),
  })
)

export const otpCodes = pgTable(
  'otp_codes',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    // sha256 hex of `${code}:${BETTER_AUTH_SECRET}` — never plaintext.
    codeHash: text('code_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    attempts: integer('attempts').notNull().default(0),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailCreatedIdx: index('otp_codes_email_created_idx').on(table.email, table.createdAt),
    ipCreatedIdx: index('otp_codes_ip_created_idx').on(table.ipAddress, table.createdAt),
  })
)

// ---------- Chat --------------------------------------------------------------

export const chatSessions = pgTable(
  'chat_sessions',
  {
    id: text('id').primaryKey(),
    visitorId: text('visitor_id')
      .notNull()
      .references(() => visitors.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    visitorIdx: index('chat_sessions_visitor_idx').on(table.visitorId),
  })
)

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    content: text('content').notNull(),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionIdx: index('chat_messages_session_idx').on(table.sessionId, table.createdAt),
  })
)

/** One review prompt quizzed inside a daily email. */
export type JpReviewWord = { dayN: number; word: string; gloss: string }

// ---------- Japanese daily study loop -----------------------------------------
// Feedback channel for the daily Japanese email sent by the house machine.
// One row per day: the house machine POSTs the day's item when it sends the
// email, the owner taps the emailed link and answers a 3-question survey, and
// the house machine pulls the answers back the next morning to schedule the
// next lesson. Nothing here is public and no PII is involved — the survey is
// reached only with a signed per-day token.

export const jpDays = pgTable(
  'jp_days',
  {
    id: text('id').primaryKey(),
    // Monotonic lesson number ("Day 012"). Authoritative counter lives on the
    // house machine; this mirrors it so the survey page can render the item.
    dayN: integer('day_n').notNull(),
    word: text('word').notNull(),
    reading: text('reading').notNull(),
    romaji: text('romaji').notNull(),
    gloss: text('gloss').notNull(),
    // [{ dayN, word, gloss }] — the review prompts quizzed in that email, so
    // the survey can ask which ones were missed.
    reviewWords: jsonb('review_words').$type<JpReviewWord[]>().notNull().default([]),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),

    // ----- survey answers; all null until the owner responds -----
    difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }),
    alreadyKnew: boolean('already_knew'),
    // Array of dayN values from reviewWords that the owner blanked on.
    missedReviews: jsonb('missed_reviews').$type<number[]>().notNull().default([]),
    note: text('note'),
    respondedAt: timestamp('responded_at', { withTimezone: true }),

    // Set when the house machine has consumed this row's feedback, so a pull
    // is idempotent and never re-applies the same grade twice.
    pulledAt: timestamp('pulled_at', { withTimezone: true }),
  },
  (table) => ({
    dayIdx: uniqueIndex('jp_days_day_n_idx').on(table.dayN),
    pullIdx: index('jp_days_pull_idx').on(table.respondedAt, table.pulledAt),
  })
)

// ---------- house research ----------------------------------------------------

/** One YouTube link on a research item. Never embedded — always a plain link. */
export type ResearchVideo = { title: string; url: string }

/**
 * Findings from the nightly research runner on the house machine.
 *
 * Same shape of relationship as jp_days: the house machine owns the queue and
 * the workflow, this table is only the published copy the email links to.
 */
export const researchItems = pgTable(
  'research_items',
  {
    id: text('id').primaryKey(),
    // research.id on the house machine; the /research/<ref> route key.
    ref: integer('ref').notNull(),
    title: text('title').notNull(),
    question: text('question').notNull(),
    findings: text('findings').notNull(),
    videos: jsonb('videos').$type<ResearchVideo[]>().notNull().default([]),
    // Hours the research concluded the job takes; written back to house.db.
    estHours: real('est_hours'),
    // The adversarial pass's conclusion.
    verdict: text('verdict'),
    project: text('project'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    refIdx: uniqueIndex('research_items_ref_idx').on(table.ref),
  })
)

// ---------- Types -------------------------------------------------------------

export type User = typeof user.$inferSelect
export type Visitor = typeof visitors.$inferSelect
export type ResumeChunk = typeof resumeChunks.$inferSelect
export type QaPair = typeof qaPairs.$inferSelect
export type ChatMessage = typeof chatMessages.$inferSelect
export type ChatSession = typeof chatSessions.$inferSelect
export type JpDay = typeof jpDays.$inferSelect
export type ResearchItem = typeof researchItems.$inferSelect
