<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  type Pair = PageData['pairs'][number]

  type EditState = {
    question: string
    answer: string
    tagsCsv: string
    busy: boolean
  }

  // Only rows currently being edited live in here. Display rows read from data.pairs.
  let edits = $state<Record<string, EditState>>({})

  // Toast per row, independent of edit state so success messages persist after save.
  type Flash = { kind: 'ok' | 'err'; msg: string }
  let flashes = $state<Record<string, Flash | null>>({})

  function startEdit(p: Pair): void {
    edits[p.id] = {
      question: p.question,
      answer: p.answer,
      tagsCsv: p.tags.join(', '),
      busy: false,
    }
    flashes[p.id] = null
  }

  function cancelEdit(id: string): void {
    delete edits[id]
  }

  async function save(p: Pair): Promise<void> {
    const s = edits[p.id]
    if (!s || s.busy) return
    s.busy = true
    flashes[p.id] = null
    try {
      const tags = s.tagsCsv
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch(`/api/admin/qa-pairs/${p.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: s.question.trim(), answer: s.answer.trim(), tags }),
      })
      const body = (await res.json()) as { ok: boolean; reembedded?: boolean; error?: string }
      if (!res.ok || !body.ok) {
        flashes[p.id] = { kind: 'err', msg: body.error ?? `Save failed (${res.status})` }
        s.busy = false
        return
      }
      flashes[p.id] = {
        kind: 'ok',
        msg: body.reembedded ? 'Saved + re-embedded' : 'Saved (answer/tags only)',
      }
      delete edits[p.id]
      await invalidateAll()
    } catch (err) {
      flashes[p.id] = { kind: 'err', msg: err instanceof Error ? err.message : 'Save failed' }
      const cur = edits[p.id]
      if (cur) cur.busy = false
    }
  }

  async function remove(p: Pair): Promise<void> {
    if (!confirm(`Delete this Q/A pair?\n\nQ: ${p.question}`)) return
    flashes[p.id] = null
    try {
      const res = await fetch(`/api/admin/qa-pairs/${p.id}`, { method: 'DELETE' })
      if (!res.ok) {
        flashes[p.id] = { kind: 'err', msg: `Delete failed (${res.status})` }
        return
      }
      delete edits[p.id]
      await invalidateAll()
    } catch (err) {
      flashes[p.id] = { kind: 'err', msg: err instanceof Error ? err.message : 'Delete failed' }
    }
  }

  let filter = $state('')
  const filtered = $derived(
    filter.trim() === ''
      ? data.pairs
      : data.pairs.filter((p) => {
          const q = filter.toLowerCase()
          return (
            p.question.toLowerCase().includes(q) ||
            p.answer.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
          )
        })
  )

  function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>

<header class="mb-6 flex items-baseline justify-between">
  <div>
    <h1 class="text-xl font-semibold text-white">Q/A pairs</h1>
    <p class="mt-1 text-sm text-ink-300">
      Admin-trained answers. Re-embeds automatically when the question text changes.
    </p>
  </div>
  <div class="text-sm text-ink-400">
    {data.pairs.length} pair{data.pairs.length === 1 ? '' : 's'}
  </div>
</header>

<div class="mb-4">
  <input
    type="text"
    class="input w-full max-w-md"
    placeholder="Filter by question, answer, or tag…"
    bind:value={filter}
  />
</div>

{#if filtered.length === 0}
  <div class="rounded-md border border-ink-700/60 bg-ink-800/30 px-4 py-10 text-center text-sm text-ink-400">
    {data.pairs.length === 0
      ? 'No Q/A pairs yet. Use /admin/training or the `pnpm qa` CLI to add some.'
      : 'No pairs match that filter.'}
  </div>
{:else}
  <ul class="flex flex-col gap-3">
    {#each filtered as p (p.id)}
      {@const edit = edits[p.id]}
      {@const flash = flashes[p.id]}
      <li class="rounded-lg border border-ink-700/60 bg-ink-800/30 p-4">
        <div class="flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-400">
          <span>
            <code class="font-mono text-ink-300">{p.id.slice(0, 8)}</code>
            · updated {fmtDate(p.updatedAt)}
          </span>
          <div class="flex gap-2">
            {#if !edit}
              <button class="btn-ghost text-xs" onclick={() => startEdit(p)}>Edit</button>
              <button
                class="btn-ghost text-xs text-red-300 hover:text-red-200"
                onclick={() => remove(p)}
              >
                Delete
              </button>
            {:else}
              <button class="btn-ghost text-xs" onclick={() => cancelEdit(p.id)} disabled={edit.busy}>
                Cancel
              </button>
              <button class="btn-primary text-xs" onclick={() => save(p)} disabled={edit.busy}>
                {edit.busy ? 'Saving…' : 'Save'}
              </button>
            {/if}
          </div>
        </div>

        {#if !edit}
          <div class="mt-3 space-y-2">
            <div>
              <p class="text-[11px] uppercase tracking-wider text-ink-500">Question</p>
              <p class="text-sm text-white">{p.question}</p>
            </div>
            <div>
              <p class="text-[11px] uppercase tracking-wider text-ink-500">Answer</p>
              <p class="whitespace-pre-wrap text-sm text-ink-200">{p.answer}</p>
            </div>
            {#if p.tags.length}
              <div class="flex flex-wrap gap-1.5">
                {#each p.tags as t (t)}
                  <span class="rounded-full bg-ink-700/60 px-2 py-0.5 text-[11px] text-ink-200">
                    {t}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div class="mt-3 space-y-3">
            <div>
              <label class="label" for={`q-${p.id}`}>Question</label>
              <textarea
                id={`q-${p.id}`}
                class="input min-h-[3rem]"
                rows="2"
                bind:value={edit.question}
              ></textarea>
              <p class="mt-1 text-[11px] text-ink-500">
                Editing this triggers a re-embed on save.
              </p>
            </div>
            <div>
              <label class="label" for={`a-${p.id}`}>Answer</label>
              <textarea
                id={`a-${p.id}`}
                class="input min-h-[6rem]"
                rows="5"
                bind:value={edit.answer}
              ></textarea>
            </div>
            <div>
              <label class="label" for={`t-${p.id}`}>Tags (comma-separated)</label>
              <input id={`t-${p.id}`} class="input" type="text" bind:value={edit.tagsCsv} />
            </div>
          </div>
        {/if}

        {#if flash}
          <p
            class={flash.kind === 'ok'
              ? 'mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300'
              : 'mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300'}
          >
            {flash.msg}
          </p>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
