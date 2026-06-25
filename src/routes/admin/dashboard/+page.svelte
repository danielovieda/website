<script lang="ts">
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  const tiles = $derived([
    { label: 'Visitors', value: data.counts.visitors, href: '/admin/visitors' },
    { label: 'Q/A pairs', value: data.counts.qaPairs, href: '/admin/training' },
    { label: 'Resume chunks', value: data.counts.resumeChunks, href: '/admin/ingest' },
    { label: 'Chat sessions', value: data.counts.chatSessions, href: '/admin/visitors' },
    { label: 'Chat messages', value: data.counts.chatMessages, href: '/admin/visitors' },
  ])
</script>

<header class="mb-8">
  <h1 class="text-2xl font-semibold text-white">Dashboard</h1>
  <p class="mt-1 text-sm text-ink-300">At-a-glance counts for the system.</p>
</header>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {#each tiles as t (t.label)}
    <a href={t.href} class="card transition-colors hover:border-accent/40">
      <p class="text-xs uppercase tracking-wide text-ink-400">{t.label}</p>
      <p class="mt-2 font-mono text-3xl font-semibold text-white">{t.value}</p>
    </a>
  {/each}
</div>

<section class="mt-10">
  <h2 class="mb-3 text-sm font-medium uppercase tracking-wide text-ink-300">Quick actions</h2>
  <div class="flex flex-wrap gap-3">
    <a class="btn-secondary" href="/admin/training">Train the AI</a>
    <a class="btn-secondary" href="/admin/ingest">Re-ingest master.yaml</a>
    <a class="btn-secondary" href="/admin/visitors">Browse visitors</a>
    <a class="btn-ghost" href="/" target="_blank" rel="noreferrer">View public site ↗</a>
  </div>
</section>
