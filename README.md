# danielovieda.com

Interactive personal site for Daniel Ovieda. Single-page public landing plus a
RAG chat surface trained on Daniel's resume, and an admin console for
training and reviewing conversations.

## Stack

- SvelteKit + Svelte 5 + TypeScript
- Tailwind CSS
- Drizzle ORM + Postgres (pgvector for embeddings)
- AI SDK v6 wired to OpenAI directly (`@ai-sdk/openai`, `gpt-4o` + `text-embedding-3-small`)
- better-auth (single-admin email/password)
- Resend for visitor OTP email
- Hosted on Vercel (`adapter-vercel`, Node 22)

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — Postgres connection string with `pgvector` enabled (Neon
  on the Vercel Marketplace works out of the box).
- `BETTER_AUTH_SECRET` — generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `BETTER_AUTH_URL` — local URL (`http://localhost:5173`) in dev.
- `RESEND_API_KEY` — from resend.com. In dev, leave blank and OTP codes are
  logged to the server console instead of emailed.
- `RESEND_FROM_EMAIL` — verified sender, e.g.
  `"Daniel's AI <noreply@danielovieda.com>"`.
- `OPENAI_API_KEY` — from platform.openai.com. Used for both chat
  completions (`gpt-4o`) and embeddings (`text-embedding-3-small`).
- `PUBLIC_SITE_URL` — public origin.
- `ADMIN_EMAIL` — the only address that can sign in to `/admin`. Defaults to
  `ovieda@gmail.com`.

Then:

```bash
pnpm db:push          # applies schema to Postgres
pnpm ingest           # chunks + embeds data/master.yaml into resume_chunks
pnpm dev
```

Open `http://localhost:5173`.

## First-time admin setup

Visit `/admin`. With no user rows in the DB, the page shows a "create the
admin account" form. Submit with the email that matches `ADMIN_EMAIL`. After
the account is created, the page becomes a sign-in form on subsequent visits.

The `before` hook in `src/lib/server/auth.ts` enforces the allowlist at the
auth layer, so even if someone were to discover this flow they could not
register a different email.

## Day-to-day admin tasks

- `/admin/dashboard` — at-a-glance counts.
- `/admin/training` — chat with the interview-mode AI. When it emits a
  ``` ```qa ``` ``` block, the right-hand pane lets you edit and save it
  into `qa_pairs` (embedded on the question).
- `/admin/ingest` — single button to re-run the YAML ingest. Idempotent.
- `/admin/visitors` — every verified visitor and their full transcript.

## Updating the resume

1. Edit the canonical master resume at
   `C:\_DEV\resume-builder\master.yaml`.
2. Copy the file into this repo at `data/master.yaml`.
3. Run `pnpm ingest` locally, OR hit "Re-ingest master.yaml" in `/admin/ingest`
   after deploying.

## Deploy

Project deploys to Vercel via `@sveltejs/adapter-vercel`. Make sure these are
set in Vercel project envs:

- `DATABASE_URL` (auto via Neon Marketplace integration)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (set to the production URL),
  `PUBLIC_SITE_URL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `OPENAI_API_KEY`
- `ADMIN_EMAIL`

## Scripts

| | |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Local preview of the production build |
| `pnpm check` | svelte-check + tsc |
| `pnpm db:generate` | Generate a Drizzle migration |
| `pnpm db:push` | Apply schema to the live DB |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm ingest` | Re-run YAML ingest from CLI |
