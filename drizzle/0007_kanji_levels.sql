-- Correct the kanji levels, and add what makes a study list usable.
--
-- The original load labelled a character with the JLPT level of the first WORD
-- it appears in. That is not the same thing as the character's own level, and
-- the error was large: 418 characters were tagged N5 when the real N5 kanji
-- list is 103. Two thirds of them appeared in exactly one N5 word - incidental
-- kanji inside beginner vocabulary, not foundational characters.
--
-- Levels now come from KANJIDIC2's jlpt field (EDRDG, CC BY-SA). That field
-- uses the pre-2010 four-level scheme; 4 -> N5 and 3 -> N4 reproduces the
-- published counts of 103 and 284-cumulative exactly, which is the check that
-- the mapping is right rather than assumed.
--
-- Idempotent - scripts/migrate.ts re-applies every file in drizzle/ each run.

ALTER TABLE kanji ADD COLUMN IF NOT EXISTS meanings jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE kanji ADD COLUMN IF NOT EXISTS on_readings jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE kanji ADD COLUMN IF NOT EXISTS kun_readings jsonb NOT NULL DEFAULT '[]'::jsonb;

-- How many words in his own catalogue use this kanji. This is the study order:
-- 日 unlocks 24 words, most characters unlock one. Strictly more useful than
-- stroke count, and it needs no source beyond the vocabulary he already owns.
ALTER TABLE kanji ADD COLUMN IF NOT EXISTS word_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS kanji_study_order_idx ON kanji (level, word_count DESC);
