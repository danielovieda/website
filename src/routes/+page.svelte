<script lang="ts">
  import Chat from '$lib/components/Chat.svelte'
  import VisitorVerifyModal from '$lib/components/VisitorVerifyModal.svelte'
  import { invalidateAll } from '$app/navigation'
  import type { PageData, LayoutData } from './$types'

  type Props = { data: PageData & LayoutData }
  let { data }: Props = $props()

  let modalOpen = $state(false)
  // Optimistic local flag — flips immediately on verify; layout reload follows.
  let localUnlocked = $state(false)

  const unlocked = $derived(data.chatUnlocked || localUnlocked)

  async function onVerified() {
    localUnlocked = true
    modalOpen = false
    // Reload server data so the cookie is reflected in layout state too.
    await invalidateAll()
  }
</script>

<main class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
  <!-- Hero -->
  <section class="mb-16">
    <p class="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
      {data.location ?? 'San Francisco Bay Area'}
    </p>
    <h1 class="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
      {data.name}
    </h1>
    <p class="mt-2 text-lg text-ink-200">
      Senior Full Stack Engineer & Operations Executive
    </p>
    <p class="mt-6 max-w-2xl text-base leading-relaxed text-ink-300">
      {data.summary}
    </p>
  </section>

  <!-- Chat / CTA -->
  <section class="mb-16">
    {#if unlocked}
      <div class="card p-4 sm:p-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-medium uppercase tracking-wide text-ink-300">
            Chat with Daniel’s AI
          </h2>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            verified
          </span>
        </div>
        <Chat />
      </div>
    {:else}
      <div
        class="card flex flex-col items-start gap-3 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent"
      >
        <h2 class="text-xl font-semibold text-white">Talk to Daniel’s AI</h2>
        <p class="text-sm text-ink-200">
          A small assistant that answers questions about Daniel’s work — projects, leadership,
          the engineering and operations side, what he’s building now. Trained on his resume
          and curated answers. Quick verify so he knows who he talked to.
        </p>
        <button class="btn-primary btn-lg mt-2" onclick={() => (modalOpen = true)}>
          Start the chat
        </button>
      </div>
    {/if}
  </section>

  <!-- Experience -->
  <section class="mb-16">
    <h2 class="mb-6 text-sm font-medium uppercase tracking-wide text-ink-300">
      Recent experience
    </h2>
    <ol class="space-y-8">
      {#each data.topExperience as exp (exp.company + exp.title + exp.start)}
        <li class="border-l border-ink-700 pl-5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="text-base font-semibold text-white">
              {exp.title}
              <span class="font-normal text-ink-300">· {exp.company}</span>
            </h3>
            <p class="font-mono text-xs text-ink-400">
              {exp.start} → {exp.end}
            </p>
          </div>
          {#if exp.location}
            <p class="mt-0.5 text-xs text-ink-400">{exp.location}</p>
          {/if}
          {#if exp.highlights.length}
            <ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-200 marker:text-ink-500">
              {#each exp.highlights as h (h)}
                <li>{h}</li>
              {/each}
            </ul>
          {/if}
          {#if exp.tech.length}
            <div class="mt-3 flex flex-wrap gap-1.5">
              {#each exp.tech.slice(0, 8) as t (t)}
                <span class="chip text-[11px]">{t}</span>
              {/each}
            </div>
          {/if}
        </li>
      {/each}
    </ol>
  </section>

  <!-- Skills -->
  {#if data.skillTags.length}
    <section class="mb-16">
      <h2 class="mb-4 text-sm font-medium uppercase tracking-wide text-ink-300">
        Tools & technologies
      </h2>
      <div class="flex flex-wrap gap-2">
        {#each data.skillTags as tag (tag)}
          <span class="chip">{tag}</span>
        {/each}
      </div>
    </section>
  {/if}

  <footer class="mt-24 text-xs text-ink-500">
    © {new Date().getFullYear()} Daniel Ovieda
  </footer>
</main>

<VisitorVerifyModal open={modalOpen} onClose={() => (modalOpen = false)} {onVerified} />
