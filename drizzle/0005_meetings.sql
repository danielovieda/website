-- Meetings: a recurring series, one entry per occurrence, an agenda built up
-- between occurrences, and notes written after.
--
-- The agenda is the point. Notes-after is an archive; the thing that changes
-- how a 1:1 goes is having somewhere to put "raise this" on the Tuesday you
-- think of it, so you walk in with three items instead of "things are fine".
--
-- Idempotent — scripts/migrate.ts re-applies every file in drizzle/ each run.

CREATE TABLE IF NOT EXISTS meetings (
  id             text PRIMARY KEY,
  title          text NOT NULL,
  with_whom      text,
  -- NULL = ad hoc. 'weekly' is the only cadence so far.
  recur          text,
  -- 0 = Sunday .. 6 = Saturday, matching JS getDay().
  recur_weekday  integer,
  meet_time      time,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamp with time zone NOT NULL DEFAULT now(),
  updated_at     timestamp with time zone NOT NULL DEFAULT now()
);

-- One row per actual occurrence. Created lazily: the next occurrence springs
-- into existence the first time something is added to its agenda, so a series
-- that runs for a year does not pre-generate fifty-two empty rows.
CREATE TABLE IF NOT EXISTS meeting_entries (
  id          text PRIMARY KEY,
  meeting_id  text NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  meets_on    date NOT NULL,
  -- Written after the meeting. Free text: what was actually said does not fit
  -- a schema, and forcing one is how a notes field stops getting used.
  notes       text,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, meets_on)
);

-- Agenda items are rows, not one text blob, because they arrive one at a time
-- across a week and each gets ticked off in the meeting.
CREATE TABLE IF NOT EXISTS meeting_agenda_items (
  id          text PRIMARY KEY,
  entry_id    text NOT NULL REFERENCES meeting_entries(id) ON DELETE CASCADE,
  body        text NOT NULL,
  discussed   boolean NOT NULL DEFAULT false,
  created_at  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meeting_entries_meeting_idx ON meeting_entries (meeting_id, meets_on DESC);
CREATE INDEX IF NOT EXISTS meeting_agenda_entry_idx ON meeting_agenda_items (entry_id);

-- A follow-up from a meeting becomes a real task, and keeps a pointer home.
-- Action items that live only in notes do not get done: nothing reminds you.
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS meeting_entry_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'meetings_recur_check' AND conrelid = 'meetings'::regclass
  ) THEN
    ALTER TABLE meetings
      ADD CONSTRAINT meetings_recur_check CHECK (recur IS NULL OR recur IN ('weekly'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'meetings_recur_needs_weekday' AND conrelid = 'meetings'::regclass
  ) THEN
    ALTER TABLE meetings
      ADD CONSTRAINT meetings_recur_needs_weekday
      CHECK (recur IS NULL OR (recur_weekday IS NOT NULL AND recur_weekday BETWEEN 0 AND 6));
  END IF;

  -- ON DELETE SET NULL, not CASCADE: deleting a meeting entry must never take
  -- an outstanding task with it. The task survives, it just loses its origin.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_items_meeting_entry_fk' AND conrelid = 'work_items'::regclass
  ) THEN
    ALTER TABLE work_items
      ADD CONSTRAINT work_items_meeting_entry_fk
      FOREIGN KEY (meeting_entry_id) REFERENCES meeting_entries(id) ON DELETE SET NULL;
  END IF;
END
$$;
