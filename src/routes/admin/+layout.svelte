<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { authClient } from '$lib/auth-client'
  import type { LayoutData } from './$types'

  type Props = { data: LayoutData; children?: import('svelte').Snippet }
  let { data, children }: Props = $props()

  const isLogin = $derived(page.url.pathname === '/admin')

  async function signOut() {
    await authClient.signOut()
    await goto('/admin')
  }

  const nav = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/training', label: 'Training' },
    { href: '/admin/qa-pairs', label: 'Q/A pairs' },
    { href: '/admin/ingest', label: 'Ingest' },
    { href: '/admin/visitors', label: 'Visitors' },
  ]
</script>

{#if isLogin || !data.user}
  <!-- Login page renders standalone, no chrome. -->
  {@render children?.()}
{:else}
  <div class="flex min-h-screen">
    <aside
      class="hidden w-56 shrink-0 flex-col border-r border-ink-700/60 bg-ink-800/40 p-4 md:flex"
    >
      <div class="mb-6 px-2">
        <p class="text-[11px] uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <p class="mt-1 text-sm font-semibold text-white">danielovieda.com</p>
      </div>
      <nav class="flex flex-col gap-1 text-sm">
        {#each nav as item (item.href)}
          {@const active = page.url.pathname.startsWith(item.href)}
          <a
            href={item.href}
            class={active
              ? 'rounded-md bg-ink-700/60 px-3 py-2 font-medium text-white'
              : 'rounded-md px-3 py-2 text-ink-300 hover:bg-ink-700/40 hover:text-white'}
          >
            {item.label}
          </a>
        {/each}
      </nav>
      <div class="mt-auto border-t border-ink-700/60 pt-4">
        <p class="px-2 text-[11px] text-ink-400 break-all">{data.user.email}</p>
        <button class="btn-ghost mt-2 w-full justify-start text-left" onclick={signOut}>
          Sign out
        </button>
      </div>
    </aside>

    <main class="flex-1 p-6 sm:p-10">
      {@render children?.()}
    </main>
  </div>
{/if}
