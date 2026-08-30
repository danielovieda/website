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
  date,
  time,
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
    // The kanji form, when there is one. `word` carries whatever is being
    // TAUGHT, which in the kana phase is the reading - so this is the only
    // place 女性 exists when the lesson is teaching じょせい.
    written: text('written'),
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

// ---------- work checklist ----------------------------------------------------

/**
 * Tasks and ideas for Daniel's job. Postgres is the source of truth here,
 * unlike house-pm/fitness/WIFE which are local-first: he edits this from a
 * phone via a signed link, and the house machine READS it over the API to
 * build weekday reminders. One writer, no sync problem.
 */
export const workItems = pgTable(
  'work_items',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    notes: text('notes'),
    // An idea routinely becomes a task; same table so its history survives.
    kind: text('kind', { enum: ['task', 'idea'] }).notNull().default('task'),
    status: text('status', { enum: ['open', 'done', 'dropped'] }).notNull().default('open'),
    // 1 highest .. 5 lowest, matching house-pm so both read the same way.
    priority: integer('priority').notNull().default(3),
    // A plain date, not a timestamp: a deadline is usually a day.
    dueDate: date('due_date'),
    // ...but sometimes it is an hour. "Noon every Thursday" cannot be
    // expressed without this, and without it a 14:00 reminder cannot tell
    // that a noon deadline has already passed.
    dueTime: time('due_time'),
    // NULL = happens once. 'weekly' is the only cadence so far.
    recur: text('recur', { enum: ['weekly'] }),
    // 0 = Sunday .. 6 = Saturday, matching JS getDay().
    recurWeekday: integer('recur_weekday'),
    // Set when this task came out of a meeting; ON DELETE SET NULL so
    // deleting the meeting entry never takes an outstanding task with it.
    meetingEntryId: text('meeting_entry_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    openIdx: index('work_items_open_idx').on(table.status, table.dueDate),
  })
)

// ---------- meetings ----------------------------------------------------------

export const meetings = pgTable('meetings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  withWhom: text('with_whom'),
  recur: text('recur', { enum: ['weekly'] }),
  recurWeekday: integer('recur_weekday'),
  meetTime: time('meet_time'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * One row per occurrence, created lazily — the next occurrence appears the
 * first time something is added to its agenda, so a year-long series does not
 * pre-generate fifty-two empty rows.
 */
export const meetingEntries = pgTable(
  'meeting_entries',
  {
    id: text('id').primaryKey(),
    meetingId: text('meeting_id')
      .notNull()
      .references(() => meetings.id, { onDelete: 'cascade' }),
    meetsOn: date('meets_on').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    byMeeting: index('meeting_entries_meeting_idx').on(table.meetingId, table.meetsOn),
    oneEntryPerDate: uniqueIndex('meeting_entries_meeting_date_key').on(
      table.meetingId,
      table.meetsOn
    ),
  })
)

/** Rows, not one blob: items arrive across a week and get ticked off in the room. */
export const meetingAgendaItems = pgTable(
  'meeting_agenda_items',
  {
    id: text('id').primaryKey(),
    entryId: text('entry_id')
      .notNull()
      .references(() => meetingEntries.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    discussed: boolean('discussed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    byEntry: index('meeting_agenda_entry_idx').on(table.entryId),
  })
)

// ---------- kanji practice ----------------------------------------------------

export type KanjiWord = { w: string; r: string; romaji: string; gloss: string }

/**
 * Stroke-order study set for JLPT N5/N4, built from Dan's own word catalogue
 * so every kanji here appears in something he is actually being taught.
 * `svg` is KanjiVG - Japanese stroke order, not the Chinese-derived data that
 * ships with hanzi-writer.
 */
export const kanji = pgTable(
  'kanji',
  {
    id: text('id').primaryKey(),
    ch: text('ch').notNull(),
    level: text('level', { enum: ['N5', 'N4', 'N3', 'N2', 'N1'] }).notNull(),
    strokeCount: integer('stroke_count').notNull(),
    svg: text('svg').notNull(),
    words: jsonb('words').$type<KanjiWord[]>().notNull().default([]),
    meanings: jsonb('meanings').$type<string[]>().notNull().default([]),
    onReadings: jsonb('on_readings').$type<string[]>().notNull().default([]),
    kunReadings: jsonb('kun_readings').$type<string[]>().notNull().default([]),
    // How many of his own words use this kanji. THE study order: 日 unlocks 26,
    // most unlock one. Stroke count says nothing about usefulness.
    wordCount: integer('word_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    chIdx: uniqueIndex('kanji_ch_idx').on(table.ch),
    levelIdx: index('kanji_level_idx').on(table.level, table.strokeCount),
  })
)

/** One row per character per day; `reps` counts the tracings. */
export const kanjiReps = pgTable(
  'kanji_reps',
  {
    id: text('id').primaryKey(),
    kanjiCh: text('kanji_ch').notNull(),
    reps: integer('reps').notNull().default(1),
    practicedOn: date('practiced_on').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    byCh: index('kanji_reps_ch_idx').on(table.kanjiCh, table.practicedOn),
    oncePerDay: uniqueIndex('kanji_reps_ch_day_key').on(table.kanjiCh, table.practicedOn),
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
export type WorkItem = typeof workItems.$inferSelect
export type Kanji = typeof kanji.$inferSelect
export type Meeting = typeof meetings.$inferSelect
export type MeetingEntry = typeof meetingEntries.$inferSelect
export type MeetingAgendaItem = typeof meetingAgendaItems.$inferSelect
