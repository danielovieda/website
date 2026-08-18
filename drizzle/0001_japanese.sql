-- Japanese daily study loop: feedback channel for the email sent by the house
-- machine. One row per lesson day. Idempotent — scripts/migrate.ts re-applies
-- every file in drizzle/ on each run.

CREATE TABLE IF NOT EXISTS jp_days (
  id             text PRIMARY KEY,
  day_n          integer NOT NULL,
  word           text NOT NULL,
  reading        text NOT NULL,
  romaji         text NOT NULL,
  gloss          text NOT NULL,
  review_words   jsonb NOT NULL DEFAULT '[]'::jsonb,
  sent_at        timestamp with time zone NOT NULL DEFAULT now(),

  difficulty     text,
  already_knew   boolean,
  missed_reviews jsonb NOT NULL DEFAULT '[]'::jsonb,
  note           text,
  responded_at   timestamp with time zone,

  pulled_at      timestamp with time zone
);

-- day_n is the natural key; the house machine upserts on it.
CREATE UNIQUE INDEX IF NOT EXISTS jp_days_day_n_idx ON jp_days (day_n);

-- Drives the pull query: answered but not yet consumed.
CREATE INDEX IF NOT EXISTS jp_days_pull_idx ON jp_days (responded_at, pulled_at);

-- Guard the enum at the database, not just in Zod — this row is written by an
-- external machine over HTTP.
DO $$
BEGIN
  IF NOT EXISTS (
    -- Scoped to this table: conname alone matches across every table and
    -- schema in the database.
    SELECT 1 FROM pg_constraint
    WHERE conname = 'jp_days_difficulty_check'
      AND conrelid = 'jp_days'::regclass
  ) THEN
    ALTER TABLE jp_days
      ADD CONSTRAINT jp_days_difficulty_check
      CHECK (difficulty IS NULL OR difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END
$$;
