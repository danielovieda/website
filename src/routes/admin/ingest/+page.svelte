<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  let running = $state(false)
  let result = $state<null | {
    totalChunks: number
    inserted: number
    updated: number
    deleted: number
    durationMs: number
  }>(null)
  let errorMsg = $state<string | null>(null)

  async function runIngest() {
    if (running) return
    running = true
    errorMsg = null
    result = null
    try {
      const res = await fetch('/api/admin/ingest', { method: 'POST' })
      const data = (await res.json()) as {
        ok: boolean
        result?: typeof result
        error?: string
      }
      if (!res.ok || !data.ok) {
        errorMsg = data.error ?? 'Ingest failed.'
        return
      }
      result = data.result ?? null
      await invalidateAll()
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Network error.'
    } finally {
      running = false
    }
  }
</script>

<header class="mb-6">
  <h1 class="text-2xl font-semibold text-white">Ingest</h1>
  <p class="mt-1 text-sm text-ink-300">
    Re-chunks <code class="text-xs">data/master.yaml</code>, embeds each chunk, and upserts into
    <code class="text-xs">resume_chunks</code>. Idempotent.
  </p>
</header>

<div class="grid gap-4 sm:grid-cols-2">
  <div class="card">
    <p class="text-xs uppercase tracking-wide text-ink-400">Current chunks</p>
    <p class="mt-2 font-mono text-3xl font-semibold text-white">{data.count}</p>
  </div>
  <div class="card">
    <p class="text-xs uppercase tracking-wide text-ink-400">Last ingest</p>
    <p class="mt-2 font-mono text-sm text-ink-200">
      {data.lastIngestAt ? new Date(data.lastIngestAt).toLocaleString() : 'never'}
    </p>
  </div>
</div>

<div class="mt-6 flex items-center gap-3">
  <button class="btn-primary" onclick={runIngest} disabled={running}>
    {running ? 'Ingesting…' : 'Re-ingest master.yaml'}
  </button>
  {#if running}
    <span class="text-xs text-ink-400">This can take 5–20s depending on resume size.</span>
  {/if}
</div>

{#if errorMsg}
  <p class="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
    {errorMsg}
  </p>
{/if}

{#if result}
  <div class="mt-6 card">
    <h2 class="text-sm font-medium uppercase tracking-wide text-ink-300">Last run</h2>
    <dl class="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
      <div>
        <dt class="text-xs text-ink-400">Total chunks</dt>
        <dd class="font-mono text-lg text-white">{result.totalChunks}</dd>
      </div>
      <div>
        <dt class="text-xs text-ink-400">Inserted</dt>
        <dd class="font-mono text-lg text-emerald-300">{result.inserted}</dd>
      </div>
      <div>
        <dt class="text-xs text-ink-400">Updated</dt>
        <dd class="font-mono text-lg text-amber-300">{result.updated}</dd>
      </div>
      <div>
        <dt class="text-xs text-ink-400">Deleted</dt>
        <dd class="font-mono text-lg text-red-300">{result.deleted}</dd>
      </div>
    </dl>
    <p class="mt-3 text-xs text-ink-400">Duration: {result.durationMs}ms</p>
  </div>
{/if}
