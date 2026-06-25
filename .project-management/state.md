# danielovieda.com: state

_Last updated: 2026-06-24_

## In flight
- Initial scaffold complete: SvelteKit + Svelte 5 + Tailwind, Drizzle schema, better-auth single-admin gate, OTP visitor flow, RAG embeddings, YAML ingest, AI SDK v6 (`@ai-sdk/svelte` Chat class) wired against the Vercel AI Gateway, public landing page, visitor verify modal, visitor chat panel, full admin console (dashboard, training, ingest, visitors browser with per-visitor transcripts), admin API endpoints (`/api/admin/qa-pairs`, `/api/admin/training`, `/api/admin/ingest`).
- Hook hardened: `/api/admin/*` is now gated alongside `/admin/*`.
- Docs written: `CLAUDE.md`, `README.md`, this state file.

## Blockers
- (none) — code is local-runnable but the user has not yet provisioned the runtime dependencies (see Open questions).

## Recent decisions (last 2 weeks)
- 2026-06-24 — Locked stack: SvelteKit + Svelte 5 + AI SDK v6 (`@ai-sdk/svelte`) + Tailwind + Drizzle + better-auth single-admin + Resend + Vercel adapter (Node 22). Plain `provider/model` strings against the AI Gateway, no per-provider SDK packages.
- 2026-06-24 — Admin login lives at `/admin` (matches the existing hook behavior). Dashboard at `/admin/dashboard`. First-ever visit with no users in DB toggles the form into a one-time signup limited to `ADMIN_EMAIL`.
- 2026-06-24 — Training-mode Q/A proposals stay in the existing ```qa fenced-block convention from `chat-prompts.ts` (extracted client-side and shown in a sidebar) rather than running a parallel `generateObject` call — keeps one model call per turn and stays consistent with the prompt the server already ships.
- 2026-06-24 — Visitor PII is only ever surfaced inside `/admin/*`. The visitor cookie is just a signed HMAC of the visitor row id; no PII in cookies.
- 2026-06-24 — Training turns are intentionally NOT persisted to `chat_messages` (admin training would otherwise pollute visitor transcripts).

## Open questions for the user
- Vercel project: link this repo to a Vercel project and enable the Vercel AI Gateway?
- Neon Postgres: provision via the Vercel Marketplace? `DATABASE_URL` needs to be set + `pgvector` extension enabled before `pnpm db:push` will succeed.
- Resend: set up the `danielovieda.com` sending domain and create an API key for `RESEND_API_KEY`?
- Generate a fresh `BETTER_AUTH_SECRET` (32+ random bytes) and set it locally + on Vercel?
- `pnpm install` was run as part of this session to satisfy the typecheck (this added `@ai-sdk/svelte`); confirm whether to keep `node_modules` or wipe before the next session.
- After Postgres is provisioned: walk through `pnpm db:push` → `pnpm ingest` → first visit to `/admin` to create the admin account (only `ADMIN_EMAIL` is accepted). Want a checklist run?
- `data/master.yaml` currently mirrors `C:\_DEV\resume-builder\master.yaml` manually. Worth a small sync script, or keep manual?
