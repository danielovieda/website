-- The written (kanji) form of the day's word.
--
-- Until now the house machine sent only what it was TEACHING, which in the
-- early kana phase is the reading: day 17 arrived as じょせい with 女性 nowhere
-- on the record. That was fine while the survey only had to echo the word
-- back, and became a gap the moment the page wanted to link each kanji to
-- stroke-order practice - there was no kanji to link.
--
-- Nullable: plenty of words have no kanji form at all.
--
-- Idempotent - scripts/migrate.ts re-applies every file in drizzle/ each run.

ALTER TABLE jp_days ADD COLUMN IF NOT EXISTS written text;
