<script lang="ts">
  import { page } from '$app/state'
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'

  type Props = { data: PageData; form: ActionData }
  let { data, form }: Props = $props()

  const token = $derived(page.params.token)

  let canvas: HTMLCanvasElement | undefined = $state()
  let drawing = false
  let traced = $state(0)
  let showGuide = $state(true)
  let showNumbers = $state(false)
  let animKey = $state(0)

  /**
   * KanjiVG ships each stroke as a <path> plus a separate group of stroke-order
   * numbers. Split them so the numbers can be toggled independently — they are
   * useful while learning the order and clutter once you know it.
   */
  const strokePaths = $derived.by(() => {
    const out: string[] = []
    const re = /<path[^>]*\sd="([^"]+)"/g
    let m
    // m[1] is guaranteed by the capture group, but TS cannot see that.
    while ((m = re.exec(data.svg))) out.push(m[1]!)
    return out
  })

  const numbers = $derived.by(() => {
    const out: { x: string; y: string; n: string }[] = []
    const re = /<text[^>]*transform="matrix\([^)]*?([\d.-]+)\s+([\d.-]+)\)"[^>]*>(\d+)<\/text>/g
    let m
    while ((m = re.exec(data.svg))) out.push({ x: m[1]!, y: m[2]!, n: m[3]! })
    return out
  })

  function pos(e: PointerEvent) {
    const r = canvas!.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (canvas!.width / r.width),
             y: (e.clientY - r.top) * (canvas!.height / r.height) }
  }
  function down(e: PointerEvent) {
    if (!canvas) return
    drawing = true
    canvas.setPointerCapture(e.pointerId)
    const c = canvas.getContext('2d')!
    c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round'
    c.strokeStyle = '#f5f5f4'
    c.beginPath()
    const { x, y } = pos(e); c.moveTo(x, y)
  }
  function move(e: PointerEvent) {
    if (!drawing || !canvas) return
    const c = canvas.getContext('2d')!
    const { x, y } = pos(e); c.lineTo(x, y); c.stroke()
  }
  function up() { drawing = false }

  function clear() {
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  }
  /** Count the tracing, then wipe so the next rep starts clean. */
  function done() { traced += 1; clear() }
</script>

<svelte:head>
  <title>{data.ch} — kanji</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-md bg-ink-900 px-4 py-6 text-ink-100">
  <div class="flex items-center justify-between text-xs">
    <a href="/kanji/{token}" class="text-ink-400 underline underline-offset-4">all kanji</a>
    <span class="text-ink-500">{data.level} · {data.strokeCount} strokes · {data.reps} traced</span>
  </div>

  <section class="mt-3 text-center">
    <p class="text-5xl">{data.ch}</p>
    {#if data.meanings.length}
      <p class="mt-1 text-sm text-ink-200">{data.meanings.join(', ')}</p>
    {/if}
    <p class="mt-1 text-xs text-ink-400">
      {#if data.onReadings.length}<span>on: {data.onReadings.join('・')}</span>{/if}
      {#if data.kunReadings.length}<span class="ml-3">kun: {data.kunReadings.join('・')}</span>{/if}
    </p>
    <p class="mt-1 text-xs text-ink-500">appears in {data.wordCount} of your words</p>
  </section>

  <!-- SAMPLE WORDS FIRST: he asked for sentences above the pad, and a kanji is
       easier to hold onto attached to words he is already being taught. -->
  {#if data.words.length}
    <section class="mt-4 rounded-lg border border-ink-700 bg-ink-800 p-3">
      {#each data.words as w (w.w)}
        <p class="border-b border-ink-700/60 py-1.5 text-sm last:border-0">
          <span class="text-base">{w.w}</span>
          <span class="text-ink-300">　{w.r}</span>
          <span class="text-ink-500 text-xs">　{w.romaji}</span>
          <span class="block text-xs text-ink-400">{w.gloss}</span>
        </p>
      {/each}
    </section>
  {/if}

  <!-- STROKE ORDER: animated by dashing each path in sequence. -->
  <section class="mt-5">
    <div class="flex items-center justify-between">
      <h2 class="text-xs uppercase tracking-wide text-ink-400">Stroke order</h2>
      <div class="flex gap-3 text-xs">
        <button onclick={() => (animKey += 1)} class="text-accent underline underline-offset-4">replay</button>
        <button onclick={() => (showNumbers = !showNumbers)} class="text-ink-400 underline underline-offset-4"
          >{showNumbers ? 'hide' : 'show'} numbers</button>
      </div>
    </div>
    {#key animKey}
      <svg viewBox="0 0 109 109" class="mx-auto mt-2 h-40 w-40">
        <g fill="none" stroke="#f5f5f4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          {#each strokePaths as dAttr, i (i)}
            <path d={dAttr} class="stroke-anim" style="--i:{i}" />
          {/each}
        </g>
        {#if showNumbers}
          <g fill="#fbbf24" font-size="6">
            {#each numbers as n, i (i)}<text x={n.x} y={n.y}>{n.n}</text>{/each}
          </g>
        {/if}
      </svg>
    {/key}
  </section>

  <!-- DRAW PAD with the character faint underneath as a tracing guide. -->
  <section class="mt-5">
    <div class="flex items-center justify-between">
      <h2 class="text-xs uppercase tracking-wide text-ink-400">Trace it · {traced} this session</h2>
      <label class="flex items-center gap-1.5 text-xs text-ink-400">
        <input type="checkbox" bind:checked={showGuide} /> guide
      </label>
    </div>

    <div class="relative mx-auto mt-2 h-72 w-72 rounded-lg border border-ink-600 bg-ink-800">
      <svg viewBox="0 0 109 109" class="pointer-events-none absolute inset-0 h-full w-full">
        <!-- Quartering lines, as on Japanese practice paper. -->
        <g stroke="#44403c" stroke-width="0.4" stroke-dasharray="3 3">
          <line x1="54.5" y1="0" x2="54.5" y2="109" /><line x1="0" y1="54.5" x2="109" y2="54.5" />
        </g>
        {#if showGuide}
          <g fill="none" stroke="#57534e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            {#each strokePaths as dAttr, i (i)}<path d={dAttr} />{/each}
          </g>
        {/if}
      </svg>
      <canvas
        bind:this={canvas}
        width="436" height="436"
        class="absolute inset-0 h-full w-full touch-none"
        onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}
      ></canvas>
    </div>

    <div class="mt-2 flex gap-2">
      <button onclick={clear} class="flex-1 rounded border border-ink-600 py-2 text-sm">Clear</button>
      <button onclick={done} class="flex-1 rounded bg-accent py-2 text-sm font-medium text-ink-900"
        >Done — next rep</button>
    </div>

    <!-- Reps are banked deliberately, not auto-saved per stroke: a write per
         tracing would be chatty and the count only matters once you stop. -->
    <form method="POST" action="?/rep" use:enhance={() => async ({ update }) => { traced = 0; await update() }}>
      <input type="hidden" name="count" value={traced} />
      <button type="submit" disabled={traced === 0}
        class="mt-2 w-full rounded border border-ink-600 py-2 text-xs text-ink-300 disabled:opacity-40"
        >Bank {traced} rep{traced === 1 ? '' : 's'}</button>
    </form>
    {#if form?.saved}
      <p class="mt-1 text-center text-xs text-accent">Saved — {form.today} today.</p>
    {/if}
  </section>

  <nav class="mt-6 flex justify-between text-sm">
    {#if data.prev}<a href="/kanji/{token}/{encodeURIComponent(data.prev)}" class="text-accent">← {data.prev}</a>{:else}<span></span>{/if}
    {#if data.next}<a href="/kanji/{token}/{encodeURIComponent(data.next)}" class="text-accent">{data.next} →</a>{/if}
  </nav>
</main>

<style>
  /* Each stroke draws itself in turn: dash the whole path, then unroll it. */
  .stroke-anim {
    stroke-dasharray: 120;
    stroke-dashoffset: 120;
    animation: draw 0.55s ease forwards;
    animation-delay: calc(var(--i) * 0.5s);
  }
  @keyframes draw { to { stroke-dashoffset: 0; } }
</style>
