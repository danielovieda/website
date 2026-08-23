-- Work items gain a deadline TIME and weekly recurrence.
--
-- Both came from one real requirement: "update the AV weekly memo, noon every
-- Thursday". A date alone cannot express it — with only a date, Thursday's
-- 14:00 reminder has no way to know a noon deadline already passed, and the
-- whole day reads as "due today" right up to midnight.
--
-- Idempotent — scripts/migrate.ts re-applies every file in drizzle/ each run.

ALTER TABLE work_items ADD COLUMN IF NOT EXISTS due_time time;

-- NULL means it happens once. 'weekly' is the only cadence so far; anything
-- else is rejected below rather than silently treated as "never repeat".
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS recur text;

-- 0 = Sunday .. 6 = Saturday, matching JS getDay() and Postgres EXTRACT(DOW).
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS recur_weekday integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_recur_check' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_recur_check CHECK (recur IS NULL OR recur IN ('weekly'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_recur_weekday_check' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_recur_weekday_check
      CHECK (recur_weekday IS NULL OR recur_weekday BETWEEN 0 AND 6);
  END IF;

  -- A weekly item without a weekday would roll forward to nowhere. Enforced
  -- here rather than trusted to the form, because the house machine and a
  -- browser both write this table.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_recur_needs_weekday' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_recur_needs_weekday
      CHECK (recur IS NULL OR recur_weekday IS NOT NULL);
  END IF;
END
$$;
