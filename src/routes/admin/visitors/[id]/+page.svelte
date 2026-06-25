<script lang="ts">
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  function fmt(d: string | null): string {
    if (!d) return '—'
    return new Date(d).toLocaleString()
  }
</script>

<a href="/admin/visitors" class="text-xs text-ink-400 hover:text-ink-200">← back to visitors</a>

<header class="mt-2 mb-6">
  <h1 class="text-2xl font-semibold text-white">{data.visitor.name}</h1>
  <p class="mt-1 text-sm text-ink-300">{data.visitor.email} · {data.visitor.phone}</p>
  <p class="mt-1 font-mono text-xs text-ink-400">
    Verified {fmt(data.visitor.verifiedAt)} · First seen {fmt(data.visitor.firstSeenAt)} ·
    Last seen {fmt(data.visitor.lastSeenAt)}
  </p>
</header>

{#if data.sessions.length === 0}
  <div class="card">
    <p class="text-sm text-ink-300">This visitor verified but hasn’t chatted yet.</p>
  </div>
{:else}
  <div class="space-y-6">
    {#each data.sessions as session, i (session.id)}
      <section class="card">
        <header class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-medium text-white">
            Session {i + 1}
            <span class="ml-2 font-mono text-xs text-ink-400">
              {fmt(session.startedAt)} → {fmt(session.lastMessageAt)}
            </span>
          </h2>
          <span class="chip text-[11px]">{session.messages.length} msgs</span>
        </header>

        {#if session.messages.length === 0}
          <p class="text-sm text-ink-400">(empty session)</p>
        {:else}
          <ol class="space-y-3">
            {#each session.messages as m (m.id)}
              <li class={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  class={m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-accent/90 px-4 py-2 text-sm text-white'
                    : 'max-w-[90%] rounded-2xl rounded-bl-sm border border-ink-700/60 bg-ink-900/40 px-4 py-2 text-sm text-ink-100'}
                >
                  <p class="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  <p class="mt-1 font-mono text-[10px] text-ink-400">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </li>
            {/each}
          </ol>
        {/if}
      </section>
    {/each}
  </div>
{/if}
