<script lang="ts">
  import { page } from '$app/state'
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'

  type Props = { data: PageData; form: ActionData }
  let { data, form }: Props = $props()

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const token = $derived(page.params.token)

  function when(d: string) {
    // Parsed as UTC and formatted as UTC: a plain date has no zone, and
    // letting the browser localise it shifts the day backwards west of GMT.
    return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
</script>

<svelte:head>
  <title>{data.meeting.title}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-xl bg-ink-900 px-4 py-8 text-ink-100">
  <a href="/work/{token}" class="text-xs text-ink-400 underline underline-offset-4">back to work</a>

  <header class="mt-3 border-b border-ink-700 pb-4">
    <h1 class="text-xl font-medium">{data.meeting.title}</h1>
    <p class="mt-1 text-sm text-ink-400">
      {#if data.meeting.withWhom}{data.meeting.withWhom} · {/if}
      {#if data.meeting.recur === 'weekly'}
        every {DAYS[data.meeting.recurWeekday ?? 0]}{#if data.meeting.meetTime}
          at {data.meeting.meetTime}{/if}
      {/if}
    </p>
  </header>

  {#if form?.error}
    <p class="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{form.error}</p>
  {/if}

  {#each data.entries as entry, i (entry.id)}
    {@const isNext = entry.meetsOn === data.upcoming}
    <section class="mt-7 {isNext ? '' : 'opacity-90'}">
      <h2 class="flex items-baseline gap-2 text-sm font-semibold">
        {when(entry.meetsOn)}
        {#if isNext}<span class="rounded bg-accent px-1.5 py-0.5 text-[10px] text-ink-900">next</span>{/if}
      </h2>

      <!-- AGENDA -->
      {#if entry.agenda.length || isNext}
        <h3 class="mt-3 text-xs uppercase tracking-wide text-ink-400">Agenda</h3>
        <ul class="mt-1">
          {#each entry.agenda as item (item.id)}
            <li class="flex items-start gap-2 py-1">
              <form method="POST" action="?/toggleAgenda" use:enhance>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  aria-label={item.discussed ? 'Mark not discussed' : 'Mark discussed'}
                  class="mt-0.5 flex h-4 w-4 items-center justify-center rounded border text-[10px]
                         {item.discussed
                    ? 'border-accent bg-accent text-ink-900'
                    : 'border-ink-500'}">{item.discussed ? '✓' : ''}</button
                >
              </form>
              <span class="text-sm {item.discussed ? 'text-ink-500 line-through' : ''}"
                >{item.body}</span
              >
            </li>
          {/each}
        </ul>
        {#if isNext}
          <form method="POST" action="?/agenda" use:enhance class="mt-2 flex gap-2">
            <input
              name="body"
              placeholder="Raise this…"
              required
              class="flex-1 rounded border border-ink-600 bg-ink-800 px-2 py-1.5 text-[16px]"
            />
            <button type="submit" class="rounded bg-accent px-3 py-1 text-sm font-medium text-ink-900"
              >Add</button
            >
          </form>
        {/if}
      {/if}

      <!-- NOTES -->
      <h3 class="mt-4 text-xs uppercase tracking-wide text-ink-400">Notes</h3>
      <form method="POST" action="?/notes" use:enhance class="mt-1">
        <input type="hidden" name="entryId" value={entry.id} />
        <textarea
          name="notes"
          rows={entry.notes ? 6 : 3}
          placeholder="What was actually said…"
          class="w-full rounded border border-ink-700 bg-ink-800 px-2 py-1.5 text-[15px] leading-relaxed"
          >{entry.notes ?? ''}</textarea
        >
        <button type="submit" class="mt-1 rounded border border-ink-600 px-3 py-1 text-xs"
          >Save notes</button
        >
      </form>

      <!-- FOLLOW-UPS -->
      {#if entry.followUps.length}
        <h3 class="mt-4 text-xs uppercase tracking-wide text-ink-400">Follow-ups</h3>
        <ul class="mt-1">
          {#each entry.followUps as f (f.id)}
            <li class="py-0.5 text-sm {f.status === 'done' ? 'text-ink-500 line-through' : ''}">
              · {f.title}{#if f.dueDate}<span class="text-ink-500"> — {f.dueDate}</span>{/if}
            </li>
          {/each}
        </ul>
      {/if}

      <form method="POST" action="?/followUp" use:enhance class="mt-2 flex flex-wrap gap-2">
        <input type="hidden" name="entryId" value={entry.id} />
        <input
          name="title"
          placeholder="Follow-up → goes on the work list"
          required
          class="min-w-0 flex-1 rounded border border-ink-700 bg-ink-800 px-2 py-1 text-[16px]"
        />
        <input type="date" name="dueDate" class="rounded border border-ink-700 bg-ink-800 px-2 py-1 text-sm" />
        <button type="submit" class="rounded border border-ink-600 px-3 py-1 text-xs">Add task</button>
      </form>

      {#if i < data.entries.length - 1}<hr class="mt-6 border-ink-800" />{/if}
    </section>
  {/each}
</main>
