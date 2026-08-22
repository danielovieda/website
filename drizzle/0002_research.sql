-- House research: findings produced by the nightly research runner on the
-- house machine, published so the summary email can link to something
-- readable. Idempotent — scripts/migrate.ts re-applies every file in drizzle/
-- on each run.

CREATE TABLE IF NOT EXISTS research_items (
  id          text PRIMARY KEY,
  -- research.id on the house machine. This is the /research/<ref> route key:
  -- the primary key stays a uuid to match every other table here, and the
  -- short integer is what goes in a link someone reads on a phone.
  ref         integer NOT NULL,
  title       text NOT NULL,
  question    text NOT NULL,
  findings    text NOT NULL,
  -- [{ title, url }] — YouTube links, rendered as links and never embedded.
  videos      jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- What the research concluded the job actually takes, in hours.
  est_hours   real,
  -- What the adversarial pass concluded. Shown on the page: research that
  -- survived a challenge reads differently from research that was never tested.
  verdict     text,
  project     text,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now()
);

-- The house machine upserts on ref, so a re-run corrects a row instead of
-- publishing a second copy of the same research at a different URL.
CREATE UNIQUE INDEX IF NOT EXISTS research_items_ref_idx ON research_items (ref);
