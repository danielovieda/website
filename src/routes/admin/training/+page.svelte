<script lang="ts">
  /**
   * Admin training console.
   *
   * Chat pane on the left talks to /api/admin/training. The system prompt
   * (chat-prompts.ts trainingSystemPrompt) instructs the model to emit
   * proposed Q/A pairs in fenced ```qa blocks. We watch each completed
   * assistant turn for those blocks and surface the most recent one in the
   * right-hand pane as an editable form.
   */

  import Chat from '$lib/components/Chat.svelte'

  type Proposal = { question: string; answer: string; tags: string }

  let proposal = $state<Proposal | null>(null)
  let tagsInput = $state('')
  let saving = $state(false)
  let saveMsg = $state<string | null>(null)
  let saveErr = $state<string | null>(null)

  const QA_RE = /```qa\s*\n([\s\S]*?)```/g

  function extractLatestQa(text: string): { question: string; answer: string } | null {
    let last: { question: string; answer: string } | null = null
    let m: RegExpExecArray | null
    QA_RE.lastIndex = 0
    while ((m = QA_RE.exec(text)) !== null) {
      const block = m[1] ?? ''
      const qMatch = block.match(/^\s*Q:\s*(.+?)\s*(?:\n|$)/m)
      const aMatch = block.match(/^\s*A:\s*([\s\S]+?)\s*$/m)
      if (qMatch && aMatch) {
        last = { question: qMatch[1]!.trim(), answer: aMatch[1]!.trim() }
      }
    }
    return last
  }

  function onAssistantTurn(text: string) {
    const found = extractLatestQa(text)
    if (!found) return
    proposal = { question: found.question, answer: found.answer, tags: tagsInput }
    saveMsg = null
    saveErr = null
  }

  async function saveProposal() {
    if (!proposal || saving) return
    saving = true
    saveErr = null
    saveMsg = null
    try {
      const tags = proposal.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch('/api/admin/qa-pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: proposal.question,
          answer: proposal.answer,
          tags,
        }),
      })
      const data = (await res.json()) as { ok: boolean; id?: string; error?: string }
      if (!res.ok || !data.ok) {
        saveErr = data.error ?? 'Save failed.'
        return
      }
      saveMsg = 'Saved. The visitor chat now has access to this Q/A.'
      proposal = null
    } catch (err) {
      saveErr = err instanceof Error ? err.message : 'Network error.'
    } finally {
      saving = false
    }
  }
</script>

<header class="mb-6">
  <h1 class="text-2xl font-semibold text-white">Training</h1>
  <p class="mt-1 text-sm text-ink-300">
    Interview-mode chat. The AI asks probing questions, then proposes Q/A pairs in
    <code class="text-xs">```qa</code> blocks. Review and save to embeddings on the right.
  </p>
</header>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
  <div class="card p-4">
    <Chat
      endpoint="/api/admin/training"
      placeholder="Tell me something to train on…"
      quickPrompts={[
        'Train me on a tough RefriTrak technical decision.',
        'Ask me about a leadership moment from A-Gas.',
        'Pick a project from my resume and dig in.',
      ]}
      onAssistantTurn={onAssistantTurn}
    />
  </div>

  <aside class="space-y-4">
    <div class="card">
      <h2 class="text-sm font-medium uppercase tracking-wide text-ink-300">Proposed Q/A</h2>
      {#if !proposal}
        <p class="mt-3 text-sm text-ink-400">
          No proposal yet. Once the AI emits a <code class="text-xs">```qa</code> block,
          it shows up here for review.
        </p>
      {:else}
        <div class="mt-4 space-y-3">
          <div>
            <label class="label" for="qa-q">Question</label>
            <textarea
              id="qa-q"
              class="input min-h-[64px] resize-y"
              bind:value={proposal.question}
            ></textarea>
          </div>
          <div>
            <label class="label" for="qa-a">Answer</label>
            <textarea
              id="qa-a"
              class="input min-h-[140px] resize-y"
              bind:value={proposal.answer}
            ></textarea>
          </div>
          <div>
            <label class="label" for="qa-t">Tags (comma-separated)</label>
            <input
              id="qa-t"
              class="input"
              type="text"
              bind:value={proposal.tags}
              placeholder="leadership, refritrak, ai"
            />
          </div>

          {#if saveErr}
            <p class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {saveErr}
            </p>
          {/if}

          <div class="flex items-center justify-between gap-2">
            <button class="btn-ghost" onclick={() => (proposal = null)} disabled={saving}>
              Discard
            </button>
            <button class="btn-primary" onclick={saveProposal} disabled={saving}>
              {saving ? 'Saving…' : 'Save to embeddings'}
            </button>
          </div>
        </div>
      {/if}
    </div>

    {#if saveMsg}
      <div
        class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
      >
        {saveMsg}
      </div>
    {/if}
  </aside>
</div>
