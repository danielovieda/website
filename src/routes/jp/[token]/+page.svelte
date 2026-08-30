<script lang="ts">
  import { untrack } from 'svelte'
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'

  type Props = { data: PageData; form: ActionData }
  let { data, form }: Props = $props()

  let busy = $state(false)

  // Pre-select on a revisit so a correction starts from what was said before.
  //
  // untrack() here is not what makes these read-once — a $state initializer
  // already runs exactly once. It is how you tell the compiler the one-time
  // read is deliberate; without it svelte-check emits state_referenced_locally
  // on every one of these lines. All three fields are treated the same way on
  // purpose.
  let difficulty = $state<string>(untrack(() => data.previous?.difficulty) ?? '')
  let alreadyKnew = $state<string>(
    untrack(() => (data.previous ? (data.previous.alreadyKnew ? 'yes' : 'no') : ''))
  )
  const missedBefore = untrack(() => new Set(data.previous?.missedReviews ?? []))

  const saved = $derived(Boolean(form?.saved))
</script>

<svelte:head>
  <title>Day {data.dayN} — {data.word}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-md bg-ink-900 px-5 py-10 text-ink-100">
  {#if saved}
    <div class="rounded-lg border border-accent/40 bg-ink-800 p-6 text-center">
      <p class="text-lg font-medium">Got it.</p>
      <p class="mt-2 text-sm text-ink-300">
        Day {data.dayN} recorded. Tomorrow's lesson will account for it.
      </p>
    </div>
  {:else}
    <header class="mb-8">
      <p class="text-xs uppercase tracking-widest text-ink-400">Day {data.dayN}</p>
      <h1 class="mt-1 text-3xl font-semibold">{data.word}</h1>
      {#if data.written && data.written !== data.word}
        <p class="text-lg text-ink-300">{data.written}</p>
      {/if}
      <p class="mt-1 text-ink-300">{data.romaji} — {data.gloss}</p>

      {#if data.kanjiBase}
        <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {#if data.kanjiInWord.length}
            <span class="text-xs text-ink-400">practise writing:</span>
            {#each data.kanjiInWord as ch (ch)}
              <a
                href="{data.kanjiBase}/{encodeURIComponent(ch)}"
                class="rounded border border-ink-600 px-2.5 py-1 text-lg leading-none hover:border-accent"
                >{ch}</a
              >
            {/each}
          {/if}
          <a href={data.kanjiBase} class="text-xs text-accent underline underline-offset-4"
            >all kanji →</a
          >
        </div>
      {/if}
    </header>

    <form method="POST" use:enhance={() => {
      busy = true
      return async ({ update }) => {
        await update()
        busy = false
      }
    }}>
      <fieldset class="mb-7">
        <legend class="mb-3 text-sm font-medium text-ink-200">How hard was it?</legend>
        <div class="grid grid-cols-3 gap-2">
          {#each ['easy', 'medium', 'hard'] as level}
            <label
              class="cursor-pointer rounded-md border px-3 py-3 text-center text-sm capitalize transition
                     has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent
                     has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ink-900
                     {difficulty === level
                       ? 'border-accent bg-accent text-accent-fg'
                       : 'border-ink-600 bg-ink-800 hover:border-ink-400'}"
            >
              <input
                type="radio"
                name="difficulty"
                value={level}
                required
                bind:group={difficulty}
                class="sr-only"
              />
              {level}
            </label>
          {/each}
        </div>
      </fieldset>

      <fieldset class="mb-7">
        <legend class="mb-3 text-sm font-medium text-ink-200">Did you already know it?</legend>
        <div class="grid grid-cols-2 gap-2">
          {#each [['yes', 'Already knew it'], ['no', 'New to me']] as [value, label]}
            <label
              class="cursor-pointer rounded-md border px-3 py-3 text-center text-sm transition
                     has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent
                     has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ink-900
                     {alreadyKnew === value
                       ? 'border-accent bg-accent text-accent-fg'
                       : 'border-ink-600 bg-ink-800 hover:border-ink-400'}"
            >
              <input
                type="radio"
                name="alreadyKnew"
                value={value}
                required
                bind:group={alreadyKnew}
                class="sr-only"
              />
              {label}
            </label>
          {/each}
        </div>
      </fieldset>

      {#if data.reviewWords.length > 0}
        <fieldset class="mb-7">
          <legend class="mb-3 text-sm font-medium text-ink-200">
            Any of today's review words you blanked on?
          </legend>
          <div class="space-y-2">
            {#each data.reviewWords as rw}
              <label
                class="flex cursor-pointer items-center gap-3 rounded-md border border-ink-600
                       bg-ink-800 px-3 py-3 text-sm hover:border-ink-400"
              >
                <input
                  type="checkbox"
                  name="missed"
                  value={rw.dayN}
                  checked={missedBefore.has(rw.dayN)}
                  class="h-4 w-4 accent-accent"
                />
                <span>
                  <span class="font-medium">{rw.word}</span>
                  <span class="text-ink-400"> — {rw.gloss}</span>
                </span>
              </label>
            {/each}
          </div>
          <p class="mt-2 text-xs text-ink-400">Leave unchecked if you got them all.</p>
        </fieldset>
      {/if}

      <label class="mb-7 block">
        <span class="mb-2 block text-sm font-medium text-ink-200">Anything else? (optional)</span>
        <textarea
          name="note"
          rows="2"
          maxlength="500"
          class="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm
                 placeholder:text-ink-500 focus:border-accent focus:outline-none"
          placeholder="Confusing particle, wrong reading, too easy..."
        >{data.previous?.note ?? ''}</textarea>
      </label>

      {#if form?.error}
        <p class="mb-4 text-sm text-red-400">{form.error}</p>
      {/if}

      <!-- Only ever disabled while a submit is in flight. It used to also be
           disabled until both radios were set, which SSR rendered into the
           HTML — with JS off nothing could clear it and the form was dead on
           arrival. `required` on the radios plus server-side validation covers
           the same ground without breaking the no-JS path. -->
      <button
        type="submit"
        disabled={busy}
        class="w-full rounded-md bg-accent px-4 py-3 font-medium text-accent-fg transition
               hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Saving...' : data.answered ? 'Update' : 'Submit'}
      </button>

      {#if data.answered}
        <p class="mt-3 text-center text-xs text-ink-400">
          You already answered this one. Submitting again replaces it.
        </p>
      {/if}
    </form>
  {/if}
</main>
