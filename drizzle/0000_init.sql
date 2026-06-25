-- Initial migration for danielovieda.com
-- Hand-written so we can add pgvector + HNSW cleanly.
-- Generated drizzle migrations should be appended after this one.

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------- better-auth ------------------------------------------------------

CREATE TABLE IF NOT EXISTS "user" (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "account" (
  id                       text PRIMARY KEY,
  user_id                  text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  account_id               text NOT NULL,
  provider_id              text NOT NULL,
  access_token             text,
  refresh_token            text,
  access_token_expires_at  timestamptz,
  refresh_token_expires_at timestamptz,
  scope                    text,
  id_token                 text,
  password                 text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id          text PRIMARY KEY,
  identifier  text NOT NULL,
  value       text NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- RAG --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "resume_chunks" (
  id         text PRIMARY KEY,
  source     text NOT NULL,
  content    text NOT NULL,
  embedding  vector(1536) NOT NULL,
  metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "resume_chunks_source_idx" ON "resume_chunks"(source);
CREATE INDEX IF NOT EXISTS "resume_chunks_embedding_hnsw" ON "resume_chunks"
  USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS "qa_pairs" (
  id         text PRIMARY KEY,
  question   text NOT NULL,
  answer     text NOT NULL,
  embedding  vector(1536) NOT NULL,
  tags       jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "qa_pairs_created_idx" ON "qa_pairs"(created_at);
CREATE INDEX IF NOT EXISTS "qa_pairs_embedding_hnsw" ON "qa_pairs"
  USING hnsw (embedding vector_cosine_ops);

-- ---------- Visitors & OTP ---------------------------------------------------

CREATE TABLE IF NOT EXISTS "visitors" (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text NOT NULL,
  verified_at   timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "visitors_email_idx" ON "visitors"(email);

CREATE TABLE IF NOT EXISTS "otp_codes" (
  id          text PRIMARY KEY,
  email       text NOT NULL,
  code_hash   text NOT NULL,
  expires_at  timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts    integer NOT NULL DEFAULT 0,
  ip_address  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "otp_codes_email_created_idx" ON "otp_codes"(email, created_at);
CREATE INDEX IF NOT EXISTS "otp_codes_ip_created_idx" ON "otp_codes"(ip_address, created_at);

-- ---------- Chat -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "chat_sessions" (
  id              text PRIMARY KEY,
  visitor_id      text NOT NULL REFERENCES "visitors"(id) ON DELETE CASCADE,
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "chat_sessions_visitor_idx" ON "chat_sessions"(visitor_id);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  id          text PRIMARY KEY,
  session_id  text NOT NULL REFERENCES "chat_sessions"(id) ON DELETE CASCADE,
  role        text NOT NULL,
  content     text NOT NULL,
  tokens_in   integer,
  tokens_out  integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "chat_messages_session_idx" ON "chat_messages"(session_id, created_at);
