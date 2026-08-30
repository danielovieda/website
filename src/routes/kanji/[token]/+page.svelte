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
      {data.kanji.length} characters · {practised} started · most useful first
    </p>
    <p class="mt-1 text-xs text-ink-500">
      Levels are the real JLPT kanji lists (KANJIDIC2): N5 is 103 characters, N4 adds 181.
      The number under each is how many of your own words use it.
    </p>
  </header>

  <div class="mt-3 flex gap-2 text-sm">
    {#each [['N5', 'N5'], ['N4', 'N4'], ['N2', 'N2'], ['N1', 'N1'], ['', 'all']] as [v, label] (label)}
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

  <!-- Ordered MOST USEFUL first: how many of his own words each character
       unlocks. 日 appears in 26; most appear in one. -->
  <div class="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
    {#each data.kanji as k (k.ch)}
      <a
        href="/kanji/{token}/{encodeURIComponent(k.ch)}"
        title="{k.level} · {k.meaning ?? ''} · {k.strokeCount} strokes · in {k.wordCount} of your words · {k.reps} traced"
        class="relative flex aspect-square items-center justify-center rounded border text-2xl
               {k.reps > 0 ? 'border-accent/60 bg-ink-800' : 'border-ink-700 bg-ink-800/40'}"
      >
        {k.ch}
        <span class="absolute bottom-0 left-0.5 text-[9px] text-ink-500">{k.wordCount}</span>
        {#if k.reps > 0}
          <span class="absolute bottom-0 right-0.5 text-[9px] text-accent">{k.reps}</span>
        {/if}
      </a>
    {/each}
  </div>
</main>
