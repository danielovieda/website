<script lang="ts">
  import { page } from '$app/state'
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  const token = $derived(page.params.token)
  const practised = $derived(data.kanji.filter((k) => k.reps > 0).length)
</script>

<svelte:head>
  <title>Kanji</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-2xl bg-ink-900 px-4 py-6 text-ink-100">
  <header class="border-b border-ink-700 pb-3">
    <h1 class="text-xl font-medium">Kanji</h1>
    <p class="mt-1 text-xs text-ink-400">
      {data.kanji.length} characters · {practised} started · from your own N5/N4 word list
    </p>
  </header>

  <div class="mt-3 flex gap-2 text-sm">
    {#each [['', 'all'], ['N5', 'N5'], ['N4', 'N4']] as [v, label] (label)}
      <a
        href={v ? `?level=${v}` : '?'}
        class="rounded border px-3 py-1 {(data.level ?? '') === v
          ? 'border-accent bg-accent text-ink-900'
          : 'border-ink-600 text-ink-300'}">{label}</a>
    {/each}
  </div>

  {#if data.activity.length}
    <p class="mt-3 text-xs text-ink-500">
      recent:
      {#each data.activity as a (a.practicedOn)}
        <span class="mr-2">{a.practicedOn.slice(5)} · {a.chars} kanji, {a.reps} reps</span>
      {/each}
    </p>
  {/if}

  <!-- Ordered fewest strokes first: the only thing that makes 687 characters
       approachable, and it tracks difficulty closely. -->
  <div class="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
    {#each data.kanji as k (k.ch)}
      <a
        href="/kanji/{token}/{encodeURIComponent(k.ch)}"
        title="{k.level} · {k.strokeCount} strokes · {k.reps} traced"
        class="relative flex aspect-square items-center justify-center rounded border text-2xl
               {k.reps > 0 ? 'border-accent/60 bg-ink-800' : 'border-ink-700 bg-ink-800/40'}"
      >
        {k.ch}
        {#if k.reps > 0}
          <span class="absolute bottom-0 right-0.5 text-[9px] text-accent">{k.reps}</span>
        {/if}
      </a>
    {/each}
  </div>
</main>
