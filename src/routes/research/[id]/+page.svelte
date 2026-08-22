<script lang="ts">
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  const when = $derived(
    new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  )
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-2xl bg-ink-900 px-5 py-10 text-ink-100">
  <header class="border-b border-ink-700 pb-5">
    <h1 class="text-2xl font-medium">{data.title}</h1>
    <p class="mt-2 text-sm text-ink-300">
      {#if data.project}{data.project} · {/if}{when}
      {#if data.estHours}
        · estimated {data.estHours}h
      {/if}
    </p>
  </header>

  <section class="mt-8">
    <h2 class="text-xs font-semibold uppercase tracking-wide text-ink-400">Researched</h2>
    <p class="mt-2 text-sm text-ink-300">{data.question}</p>
  </section>

  <!-- Plain text, whitespace preserved. The runner writes prose, and rendering
       untrusted model output as HTML would be a second problem for no gain. -->
  <section class="mt-8">
    <h2 class="text-xs font-semibold uppercase tracking-wide text-ink-400">Findings</h2>
    <div class="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{data.findings}</div>
  </section>

  {#if data.videos.length}
    <section class="mt-8">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-ink-400">Video</h2>
      <ul class="mt-3 space-y-3">
        {#each data.videos as video (video.url)}
          <li>
            <!-- Deliberately a plain link, not an embed: these open in the
                 native YouTube app on a phone. -->
            <a
              href={video.url}
              rel="noopener noreferrer"
              class="text-accent underline underline-offset-4 hover:no-underline"
            >
              {video.title}
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if data.verdict}
    <section class="mt-8 rounded-lg border border-ink-700 bg-ink-800 p-4">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-ink-400">Review</h2>
      <p class="mt-2 text-sm text-ink-300">{data.verdict}</p>
    </section>
  {/if}
</main>
