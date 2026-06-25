<script lang="ts">
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  function fmt(d: string | null): string {
    if (!d) return '—'
    return new Date(d).toLocaleString()
  }
</script>

<header class="mb-6">
  <h1 class="text-2xl font-semibold text-white">Visitors</h1>
  <p class="mt-1 text-sm text-ink-300">
    Identity-verified visitors who unlocked chat. Sorted by most recent activity.
  </p>
</header>

{#if data.visitors.length === 0}
  <div class="card">
    <p class="text-sm text-ink-300">No verified visitors yet.</p>
  </div>
{:else}
  <div class="card overflow-x-auto p-0">
    <table class="w-full text-sm">
      <thead class="text-left text-xs uppercase tracking-wide text-ink-400">
        <tr class="border-b border-ink-700/60">
          <th class="px-4 py-3 font-medium">Name</th>
          <th class="px-4 py-3 font-medium">Email</th>
          <th class="px-4 py-3 font-medium">Phone</th>
          <th class="px-4 py-3 font-medium">Verified</th>
          <th class="px-4 py-3 font-medium">Last seen</th>
          <th class="px-4 py-3 text-right font-medium">Messages</th>
        </tr>
      </thead>
      <tbody>
        {#each data.visitors as v (v.id)}
          <tr class="border-b border-ink-700/40 last:border-0 hover:bg-ink-700/20">
            <td class="px-4 py-3">
              <a
                href={`/admin/visitors/${v.id}`}
                class="font-medium text-white hover:text-accent"
              >
                {v.name}
              </a>
            </td>
            <td class="px-4 py-3 text-ink-300">{v.email}</td>
            <td class="px-4 py-3 font-mono text-xs text-ink-300">{v.phone}</td>
            <td class="px-4 py-3 font-mono text-xs text-ink-400">{fmt(v.verifiedAt)}</td>
            <td class="px-4 py-3 font-mono text-xs text-ink-400">{fmt(v.lastSeenAt)}</td>
            <td class="px-4 py-3 text-right font-mono">{v.messageCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
