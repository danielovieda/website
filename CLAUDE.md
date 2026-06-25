# danielovieda.com — agent guide

Interactive personal site for Daniel Ovieda. Single-page public landing plus a
chat-with-AI surface backed by RAG over his resume. Admin console for training
the AI and reviewing visitor conversations.

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

- **DO NOT commit. DO NOT push. DO NOT `git init`.** Don't even stage. The
  user manages the repo.
- Don't introduce new env vars without updating `.env.example`. The full set is
  documented there.
- Don't add a top-level nav bar or extra public pages. This is a deliberate
  single-page experience.
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
| Admin ingest | `src/routes/admin/ingest/` + `/api/admin/ingest` |
| Visitors browser | `src/routes/admin/visitors/` |
| Better-auth proxy | `src/routes/api/auth/[...all]/+server.ts` |
| RAG | `src/lib/server/{rag,embeddings}.ts` |
| Prompts | `src/lib/server/chat-prompts.ts` |
| Schema | `src/lib/server/db/schema.ts` |
| YAML ingest | `src/lib/server/ingest/yaml-ingest.ts` |

## Local dev

```
pnpm install
cp .env.example .env  # then fill in DATABASE_URL, BETTER_AUTH_SECRET, etc.
pnpm db:push
pnpm ingest           # one-time seed of resume_chunks
pnpm dev
```

First admin: visit `/admin` — if no users exist yet, the form switches to
"create the admin account". Only `ADMIN_EMAIL` is accepted.
