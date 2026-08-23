-- Work checklist: tasks and ideas for Daniel's job, edited from a phone via a
-- signed link and read by the house machine to build weekday reminders.
-- Idempotent — scripts/migrate.ts re-applies every file in drizzle/ on each run.

CREATE TABLE IF NOT EXISTS work_items (
  id            text PRIMARY KEY,
  title         text NOT NULL,
  notes         text,
  -- 'task' is something to do; 'idea' is something to think about and has no
  -- deadline pressure. Kept in one table because an idea routinely becomes a
  -- task and moving rows between tables loses its history.
  kind          text NOT NULL DEFAULT 'task',
  status        text NOT NULL DEFAULT 'open',
  -- 1 highest .. 5 lowest, matching house-pm so the two read the same way.
  priority      integer NOT NULL DEFAULT 3,
  due_date      date,
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  updated_at    timestamp with time zone NOT NULL DEFAULT now(),
  completed_at  timestamp with time zone
);

-- Drives the reminder query: open work, soonest deadline first.
CREATE INDEX IF NOT EXISTS work_items_open_idx ON work_items (status, due_date);

-- Guard the enums at the database, not just in Zod: these rows are written by
-- a browser form AND read by an external machine over HTTP.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_kind_check' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_kind_check CHECK (kind IN ('task', 'idea'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_status_check' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_status_check CHECK (status IN ('open', 'done', 'dropped'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_priority_check' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_priority_check CHECK (priority BETWEEN 1 AND 5);
  END IF;
END
$$;
