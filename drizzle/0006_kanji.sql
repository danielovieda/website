-- Kanji practice: stroke-order study and handwriting drill for JLPT N5/N4.
--
-- The character set is derived from Dan's OWN catalogue (japanese/words.sqlite)
-- rather than a generic JLPT list: every kanji here appears in a word he is
-- actually being taught, and each row carries those words. Studying 日 next to
-- 毎日, 今日, 一日 is the point -- a kanji in isolation is a shape, a kanji in
-- five words he already half-knows is a hook.
--
-- Stroke data is KanjiVG, which is specifically JAPANESE. Deliberately not
-- hanzi-writer's bundled data, which is Chinese-derived: stroke order genuinely
-- differs between the two for characters like 田 and 必, and teaching Chinese
-- order for a Japanese exam would be worse than teaching nothing.
--
-- Idempotent - scripts/migrate.ts re-applies every file in drizzle/ each run.

CREATE TABLE IF NOT EXISTS kanji (
  id            text PRIMARY KEY,
  -- The character itself. Natural key.
  ch            text NOT NULL,
  -- The JLPT level of the FIRST word it appears in, N5 before N4.
  level         text NOT NULL,
  stroke_count  integer NOT NULL,
  -- Raw KanjiVG SVG. ~3.7 KB each, 687 rows, about 2.5 MB total - small
  -- enough to keep inline and avoid a second fetch per character.
  svg           text NOT NULL,
  -- [{w, r, romaji, gloss}] - up to six words from his catalogue using it.
  words         jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS kanji_ch_idx ON kanji (ch);
CREATE INDEX IF NOT EXISTS kanji_level_idx ON kanji (level, stroke_count);

-- One row per practice rep. Deliberately thin: he said tracking "doesn't have
-- to be that serious", so this records that a rep happened and nothing about
-- how good it was. Stroke-accuracy scoring would need median data KanjiVG does
-- not carry, and a wrong score is worse than no score.
CREATE TABLE IF NOT EXISTS kanji_reps (
  id          text PRIMARY KEY,
  kanji_ch    text NOT NULL,
  reps        integer NOT NULL DEFAULT 1,
  practiced_on date NOT NULL,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (kanji_ch, practiced_on)
);

CREATE INDEX IF NOT EXISTS kanji_reps_ch_idx ON kanji_reps (kanji_ch, practiced_on DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'kanji_level_check' AND conrelid = 'kanji'::regclass
  ) THEN
    ALTER TABLE kanji ADD CONSTRAINT kanji_level_check CHECK (level IN ('N5','N4','N3','N2','N1'));
  END IF;
END
$$;
