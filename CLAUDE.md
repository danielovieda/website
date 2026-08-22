# danielovieda.com — agent guide

Daniel Ovieda's site and, increasingly, **the web surface for whatever the
house system needs a browser for** (he owns this repo — `ovieda@gmail.com`,
sole admin).

It started as an interactive resume and is no longer only that. The resume
experience is still the front door; alongside it now live small purpose-built
surfaces for other projects on the NUC — the first is the Japanese daily-study
feedback survey at `/jp/[token]`. Expect more. When something on the house
machine needs a screen, a form, or a link that survives being tapped on a
phone, it belongs here rather than in a new app.

The resume front door: single-page no-nav landing where a verified
visitor (name + non-public email + phone + emailed 6-digit OTP) unlocks a chat
with "Daniel's AI." The AI speaks in **first person AS Daniel**, answering only
from RAG context (resume chunks from `data/master.yaml` plus admin-curated Q/A
pairs). Admin console at `/admin` exposes a training chat, ingest button, Q/A
browser, and visitor inbox.

The whole point of the app: Daniel can talk to me (the agent) in a Claude Code
session to populate Q/A pairs fast, instead of typing through the in-browser
admin training UI. See **Agent-driven Q/A training** below — that's the
primary day-to-day workflow.

## Locked stack decisions — do not change

- **SvelteKit** + **Svelte 5** (runes) + **TypeScript strict**.
- **AI SDK v6** (`ai@^6`) wired to OpenAI directly via `@ai-sdk/openai`. Chat
  model: `openai('gpt-4o')`. Embedding model:
  `openai.textEmbeddingModel('text-embedding-3-small')` (1536 dims). Auth via
  `OPENAI_API_KEY`. No Vercel AI Gateway in this project.
- **`@ai-sdk/svelte`** for the chat client (`new Chat({ api: '/api/chat' })`).
- **Tailwind CSS** with the existing `ink` + `accent` palette in
  `tailwind.config.ts`. Don't add custom theme bloat.
- **better-auth** with a single-admin gate. The only address that may sign in
  is `ADMIN_EMAIL` (defaults to `ovieda@gmail.com`). Email/password only — no
  social, no magic links.
- **Drizzle ORM** against Postgres + **pgvector** for embeddings.
- **Resend** for transactional email (visitor OTP).
- **Vercel** for hosting (`@sveltejs/adapter-vercel`, Node 22 runtime).

## Source of truth for content

`data/master.yaml` is the source of truth for everything resume-shaped. The
landing page reads it via `$lib/server/resume.ts`; the RAG corpus is rebuilt
from it via `$lib/server/ingest/yaml-ingest.ts`.

The canonical copy lives at `C:\_DEV\resume-builder\master.yaml`. The copy in
this repo at `data/master.yaml` should be periodically synced from there —
this is a manual copy for now, not a build step. **Never hardcode resume
content into Svelte components.**

## Voice convention — locked

Visitor chat speaks as Daniel in **first person**. Storage shape that supports
this:

- **`qa_pairs.question`** — second person ("What did you do for SOC 2?"). Reads
  as the visitor addressing Daniel directly.
- **`qa_pairs.answer`** — first person ("I led the SOC 2 initiative…"). The
  exact voice the model echoes back.
- **`resume_chunks.content`** — past tense without explicit subject ("Founded
  and shipped…", "Owned the P&L…"). Natural as first person. Not rewritten on
  ingest.

The 2nd-person Q / 1st-person A pattern in the retrieved context block primes
the model to keep first-person voice for the whole answer. The visitor system
prompt in `src/lib/server/chat-prompts.ts` enforces this; don't relax it.

When proposing new Q/A pairs (agent-driven or via in-app training):

- Q: "What did you build at RefriTrak?" — **not** "What did Daniel build at RefriTrak?"
- A: "I built a multi-tenant B2B SaaS platform…" — **not** "Daniel built…"

If you find old third-person pairs in `qa_pairs` (early scaffolding artifacts),
they retrieve fine via embeddings but leak voice — flag them so Daniel can
rewrite via `/admin/qa-pairs` or the `pnpm qa` CLI.

## Voice polish guide — read before editing any answer

`data/personalized-response.md` captures Daniel's authentic voice, derived from
analysis of his approved Q/A pairs. **Read it before polishing any answer.** It
documents:

- Core voice rules (first person, named-company openers, em-dashes, contrast pattern)
- Sentence rhythm + length targets per answer type
- Vocabulary signatures (`bottom line`, `ride along`, `leadership by example`, `adapt and overcome`, etc.)
- What Daniel never does (lesson tails, gloat, jargon, third person)
- Cross-discipline analogies he reaches for (Marines → eng, ops → eng, founder → ops)
- 10 rules of thumb for the polisher

When Daniel says "polish this in my tone" or "make it 10/10 in my voice," that
file is the source. If you find yourself drifting toward corporate phrasing,
re-read the file's "What Daniel avoids" section before saving.

## Agent-driven Q/A training — the primary workflow

Daniel's preferred way to populate `qa_pairs` is to open Claude Code in this
repo and talk to the agent (often via mic dictation). The agent plays
interviewer; saves accepted pairs via the `pnpm qa` CLI. This is **faster and
cheaper than `/admin/training`** — no website round-trips, no `gpt-4o` chat
tokens spent on interview turns (only the ~$0.00002 embedding call per saved
pair).

**The loop:**

1. Daniel names a topic ("ask me about FormDr", "I want to add context on the
   AI quoting system at MS Media").
2. Agent plays interviewer: 1–3 probing follow-ups to extract specifics —
   numbers, dates, outcomes, tradeoffs, what failed, what he'd do differently.
   Generic answers don't retrieve well; specific ones do.
3. Agent proposes a Q/A pair in the chat, formatted exactly:
   ```
   Q: <2nd person question a visitor would ask>
   A: <1st person answer based on what Daniel just said>
   ```
4. Daniel says "save" / "save it" / "yes" — or corrects ("change the A to…",
   "shorter").
5. Agent runs `pnpm qa add` to persist + embed. Repeat.

**Before adding, dedupe.** Run `pnpm qa search "topic phrase"` against the
existing corpus. If a high-similarity pair already exists (score > 0.7), tell
Daniel and offer to edit it instead of inserting a near-duplicate.

**The CLI** (`scripts/qa.ts`, npm script `qa`):

```
pnpm qa add -- "question" "answer" [tag1,tag2,...]
pnpm qa add-json -- '{"question":"...","answer":"...","tags":["..."]}'
pnpm qa add-file <path>
pnpm qa list [--limit 20]
pnpm qa search "query text" [--limit 5]
pnpm qa delete <id-or-prefix>
```

Notes:

- **On Windows (this is a Windows repo), always use `add-file`** for anything
  longer than a one-liner. Daniel works in PowerShell/cmd; both garble the
  embedded apostrophes, em-dashes, and double quotes that show up in real
  Q/A answers. The Bash tool in Claude Code also routes through cmd.exe in
  this repo and exhibits the same bug. The reliable workflow is: drop the
  JSON payload into a scratchpad file via Write, then `pnpm qa add-file
  <path>`. No quoting drama.
- The `--` after `add` is **required** by pnpm to forward args verbatim. The
  script also strips a literal `--` from argv as a safety net, but include it
  to be portable.
- `add-json` works on Unix shells where single-quote string literals preserve
  content verbatim. Keep it as a fallback.
- `pnpm qa search` runs the same OpenAI embedding call the visitor chat does
  (`text-embedding-3-small`) and ranks `qa_pairs` by cosine similarity. Use it
  liberally — it's pennies-per-million tokens.
- Tags are free-form labels (e.g. `formdr,soc2,healthtech`). Used today only
  for filtering in `/admin/qa-pairs`; not retrieved on.

**`master.yaml` is read-only from the agent's side.** The canonical lives at
`C:\_DEV\resume-builder\master.yaml`. If Daniel says "the resume changed,"
sync the file into `data/master.yaml` and run `pnpm ingest`. Do NOT edit the
resume from inside this repo — it diverges from the source of truth.

**Resetting the corpus** (rare):

```
pnpm ingest                                    # idempotent re-embed of master.yaml
pnpm qa list                                   # audit
pnpm qa delete <id-prefix>                     # surgically drop bad pairs
```

There is no "wipe all qa_pairs" command on purpose — destructive ops need
intent. If Daniel asks, write a one-shot SQL via `tsx` rather than
generalizing the CLI.

## Japanese daily-study loop

A `claude -p` job on the house NUC emails Daniel one Japanese word each
morning. This site is the **feedback channel** for it — the NUC owns the
curriculum and the schedule; the only thing that lives here is one row per day
in `jp_days`.

The cycle:

1. NUC sends the email and `POST`s the item to `/api/jp/day` (bearer
   `JP_API_TOKEN`), upserting on `day_n`.
2. That POST returns `surveyUrl` — the site mints the link itself, signing
   `<dayN>.<hmac>` with `JP_LINK_SECRET` (see `jp-token.ts`). 35 characters,
   fits one line of plain text. **The signing key never leaves Vercel**; the
   NUC holds only `JP_API_TOKEN`, which can announce a day and read feedback
   but cannot forge a link for any other day.
3. Daniel taps it and answers three questions: how hard, did he already know
   it, which review words he blanked on. Plus an optional note.
4. Next morning the NUC `POST`s `/api/jp/feedback`, which claims every
   answered-but-unconsumed row **and marks them consumed in the same call.**
   It is POST, not GET, precisely because it mutates.

Things that will bite you:

- **Claiming feedback consumes it.** Don't call `/api/jp/feedback` to "have a
  look" — a row is delivered exactly once. Query `jp_days` directly to inspect.
  A re-submitted survey clears `pulled_at`, so corrections do get redelivered.
- **`takeFeedback` must stay a single `UPDATE ... RETURNING`.** It was a
  select-then-update loop and that was wrong twice: a correction submitted
  between the select and the update was marked consumed while the stale
  snapshot was returned (lost for good), and two overlapping calls both read
  before either wrote, delivering the same grade twice. Do not "simplify" it
  back into a read followed by a write.
- **`/api/jp/day` resolves the link before it writes.** It used to record the
  row and then discover `PUBLIC_SITE_URL` was missing, returning 500 to a
  caller that sent no email — leaving a day marked as taught that never was.
- **Re-announcing a day must never wipe a grade.** `recordDay` upserts the
  item fields only; the survey columns are deliberately untouched.
- **`JP_API_TOKEN` fails closed.** Unset means both endpoints reject
  everything. They never fall open.
- **`JP_LINK_SECRET` is deliberately not `BETTER_AUTH_SECRET`.** Don't
  "simplify" by reusing the auth secret. It would hand link-minting authority
  the same key that signs admin sessions, and rotating that key — a routine
  act that should only log Daniel out — would 404 every survey link in every
  email already sent. It also fails closed: unset means tokens can be neither
  signed nor verified.
- **`PUBLIC_SITE_URL` must be set** or `/api/jp/day` returns 500 rather than
  emitting a link with a broken base.
- The survey page is public but unlisted and `noindex`, and the token grants
  nothing except grading one Japanese word. No PII is involved.

## This database is production

`DATABASE_URL` points at the **same Neon database in dev and in production** —
there is no separate dev instance. Daniel's instruction, 2026-08-17: *"we'll
use this same URL for dev AND production so don't do any deletes or drops that
aren't deliberate."*

So: no `DROP`, no `TRUNCATE`, no unqualified `DELETE` or `UPDATE`, ever, unless
Daniel has asked for that exact thing. `pnpm db:migrate` re-applies **every**
file in `drizzle/` on each run, so every statement in every migration must stay
idempotent (`IF NOT EXISTS` / guarded `DO $$` blocks). Before running it,
re-read the files — one destructive line in an old migration would run again
against live data. Take row counts before and after anything structural and
confirm they match.

Live as of 2026-08-17: 134 `qa_pairs`, 178 `resume_chunks`, 78 `chat_messages`,
1 visitor.

## Verifying a deploy

`src/lib/server/build-id.ts` holds a `BUILD_ID` string. `/push/<BUILD_ID>`
returns `200 OK`; every other id 404s. Change the id, push, then poll the URL
until it answers 200 — that is proof the running bundle is the one just pushed,
rather than Vercel still serving the previous build or having failed the build
entirely. Without it, "the push succeeded" only means GitHub accepted it.


## Auth model

There are two completely separate identity surfaces:

1. **Admin** (`/admin/*`) — better-auth session, email/password,
   single-allowlist email. Enforced in `hooks.server.ts` (redirects unauth
   `/admin/*` → `/admin`; returns 401 JSON for unauth `/api/admin/*`). Also
   enforced by a `before` hook in `auth.ts` so non-admin sign-up/sign-in
   requests fail at the auth layer.
2. **Visitor** (`/api/chat`, landing chat) — signed cookie (`do-visitor`) set
   by `/api/visitor/verify-otp` after OTP verification. HMAC over the visitor
   row id. The cookie is the only thing that unlocks chat — no DB session
   table.

**One source of truth per gate.** Don't add a second guard inside admin route
files; the hook is authoritative.

## Discipline

- **Commit and push freely — no approval needed** (changed 2026-08-22).
  Daniel granted standing authority: *"you have full authority to commit and
  push without direct approval from me."* This replaces the old hands-off rule,
  which required asking every time and had been waived once already on
  2026-08-17 for the Japanese study loop. What did **not** change: a push is
  not done until `/push/<BUILD_ID>` answers 200, and the database is shared
  between dev and production, so a migration ships live the moment it runs.
- Don't introduce new env vars without updating `.env.example`. The full set is
  documented there.
- **Public routes are fine** (changed 2026-08-17). The old rule here forbade
  extra public pages; that was written when the site was only an interactive
  resume. New surfaces for other house projects are the point now. Two things
  still hold: **don't add a top-level nav bar**, and **don't link new surfaces
  from the landing page** — the resume front door stays a single, focused
  experience, and a private utility reached by a signed link has no business
  advertising itself. Mark such pages `noindex`.
- Don't paginate the visitors list — it's expected to stay small.
- Visitor PII (name/email/phone) only ever surfaces inside `/admin/*`.

## Where to look

| Area | File |
|---|---|
| Public landing | `src/routes/+page.{svelte,server.ts}` |
| Chat UI | `src/lib/components/Chat.svelte` |
| Visitor verify modal | `src/lib/components/VisitorVerifyModal.svelte` |
| Visitor chat endpoint | `src/routes/api/chat/+server.ts` |
| Visitor OTP | `src/routes/api/visitor/{request,verify}-otp/+server.ts` |
| Admin shell | `src/routes/admin/+layout.{svelte,server.ts}` |
| Admin login | `src/routes/admin/+page.{svelte,server.ts}` |
| Admin dashboard | `src/routes/admin/dashboard/` |
| Admin training | `src/routes/admin/training/` + `/api/admin/training` |
| Admin Q/A browser | `src/routes/admin/qa-pairs/` + `/api/admin/qa-pairs/[id]` |
| Admin ingest | `src/routes/admin/ingest/` + `/api/admin/ingest` |
| Visitors browser | `src/routes/admin/visitors/` |
| Agent Q/A CLI | `scripts/qa.ts` (`pnpm qa …`) |
| Migration runner | `scripts/migrate.ts` (`pnpm db:migrate`) |
| Japanese survey (public, token-gated) | `src/routes/jp/[token]/` |
| Japanese machine API | `src/routes/api/jp/{day,feedback}/+server.ts` |
| Japanese helpers | `src/lib/server/{jp,jp-token,jp-auth}.ts` |
| Deploy verification | `src/routes/push/[id]/` + `src/lib/server/build-id.ts` |
| Better-auth proxy | `src/routes/api/auth/[...all]/+server.ts` |
| RAG | `src/lib/server/{rag,embeddings}.ts` |
| Prompts | `src/lib/server/chat-prompts.ts` |
| Schema | `src/lib/server/db/schema.ts` |
| YAML ingest | `src/lib/server/ingest/yaml-ingest.ts` |

## Local dev

```
pnpm install
cp .env.example .env  # then fill in DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET, etc.
pnpm db:migrate       # applies drizzle/0000_init.sql (pgvector + HNSW + tables)
pnpm ingest           # one-time seed of resume_chunks from data/master.yaml
pnpm dev
```

`.env` is loaded into `process.env` by `vite.config.ts` via Vite's `loadEnv`.
Server modules read `process.env.*` directly — that works because of the
hoist. Do NOT remove the hoist; SvelteKit alone doesn't populate `process.env`
for SSR modules (only `import.meta.env` for client code).

`scripts/migrate.ts` exists because `drizzle-kit push` cannot run the
`CREATE EXTENSION vector` statement or the HNSW index DDL — both must be
applied via raw SQL. Use `pnpm db:migrate` after schema changes that need a
hand-written migration; use `pnpm db:push` for pure column adds where
generating a fresh migration via `pnpm db:generate` is overkill.

First admin: visit `/admin` — if no users exist yet, the form switches to
"create the admin account". Only `ADMIN_EMAIL` is accepted.

## Where data lives in Postgres

| Table | What | Embedded? |
|---|---|---|
| `user`, `session`, `account`, `verification` | better-auth (single admin) | no |
| `resume_chunks` | `master.yaml` chunks — id, source path, content, metadata | yes (`embedding vector(1536)`, HNSW) |
| `qa_pairs` | Admin-curated answers (this is what Daniel grows over time) | yes (embedded on the **question** text only) |
| `visitors` | name + email + phone + verified_at + first/last seen | no |
| `otp_codes` | hashed 6-digit codes, 10-min expiry, attempt counter | no |
| `chat_sessions`, `chat_messages` | every visitor conversation, role + content + tokens | no |
| `jp_days` | one row per Japanese lesson day: the emailed item + the owner's survey answers | no |

RAG retrieval (`src/lib/server/rag.ts`):
- Top 4 from `qa_pairs` + top 6 from `resume_chunks`, each scored as
  `1 - cosine_distance`.
- `qa_pairs` get a **+0.05 score boost** before merging — admin-curated answers
  beat raw resume snippets of similar relevance. This is intentional and is
  the lever for "make the AI smarter on topic X without re-engineering."
