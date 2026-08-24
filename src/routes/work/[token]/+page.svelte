<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/state'
  import type { ActionData, PageData } from './$types'

  type Props = { data: PageData; form: ActionData }
  let { data, form }: Props = $props()

  let adding = $state(false)

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function overdue(due: string | null) {
    return Boolean(due && due < data.today)
  }
  function dueToday(due: string | null) {
    return due === data.today
  }
  const tasks = $derived(data.items.filter((i) => i.kind === 'task'))
  const ideas = $derived(data.items.filter((i) => i.kind === 'idea'))
</script>

<svelte:head>
  <title>Work</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto min-h-screen max-w-xl bg-ink-900 px-4 py-8 text-ink-100">
  <header class="flex items-baseline justify-between border-b border-ink-700 pb-4">
    <h1 class="text-xl font-medium">Work</h1>
    <a
      href={data.showDone ? '?' : '?done=1'}
      class="text-xs text-ink-400 underline underline-offset-4">{data.showDone ? 'hide done' : 'show done'}</a
    >
  </header>

  {#if form?.error}
    <p class="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{form.error}</p>
  {/if}

  <!-- Add first: on a phone this is the thing you came to do. -->
  <form
    method="POST"
    action="?/add"
    class="mt-5 rounded-lg border border-ink-700 bg-ink-800 p-3"
    use:enhance={() => {
      adding = true
      return async ({ update }) => {
        await update()
        adding = false
      }
    }}
  >
    <input
      name="title"
      placeholder="Add a task or idea"
      required
      maxlength="300"
      class="w-full rounded border border-ink-600 bg-ink-900 px-3 py-2 text-[16px]"
    />
    <div class="mt-2 flex flex-wrap gap-2 text-sm">
      <select name="kind" class="rounded border border-ink-600 bg-ink-900 px-2 py-1">
        <option value="task">task</option>
        <option value="idea">idea</option>
      </select>
      <select name="priority" class="rounded border border-ink-600 bg-ink-900 px-2 py-1">
        <option value="1">P1</option>
        <option value="2">P2</option>
        <option value="3" selected>P3</option>
        <option value="4">P4</option>
        <option value="5">P5</option>
      </select>
      <input type="date" name="dueDate" class="rounded border border-ink-600 bg-ink-900 px-2 py-1" />
      <button
        type="submit"
        disabled={adding}
        class="ml-auto rounded bg-accent px-4 py-1 font-medium text-ink-900 disabled:opacity-50"
        >{adding ? '...' : 'Add'}</button
      >
    </div>
  </form>

  {#snippet row(item: (typeof data.items)[number])}
    <li class="flex items-start gap-3 border-b border-ink-800 py-3">
      <form method="POST" action="?/toggle" use:enhance>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          aria-label={item.recur
            ? 'Done for this week'
            : item.status === 'done'
              ? 'Reopen'
              : 'Complete'}
          title={item.recur ? 'Rolls forward to the next occurrence' : undefined}
          class="mt-0.5 flex h-5 w-5 items-center justify-center rounded border
                 {item.status === 'done' ? 'border-accent bg-accent text-ink-900' : 'border-ink-500'}"
          >{item.status === 'done' ? '✓' : ''}</button
        >
      </form>

      <div class="min-w-0 flex-1">
        <p class="text-[15px] {item.status === 'done' ? 'text-ink-500 line-through' : ''}">
          {item.title}
        </p>
        {#if item.notes}
          <p class="mt-1 text-xs text-ink-400">{item.notes}</p>
        {/if}
        <div class="mt-1 flex items-center gap-2 text-xs">
          <span class="text-ink-500">P{item.priority}</span>
          <!-- Editable inline: changing a deadline is the second most common
               thing after ticking something off. -->
          <form method="POST" action="?/due" use:enhance class="contents">
            <input type="hidden" name="id" value={item.id} />
            <input
              type="date"
              name="dueDate"
              value={item.dueDate ?? ''}
              onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
              class="rounded border border-ink-700 bg-transparent px-1 py-0.5 text-xs
                     {overdue(item.dueDate)
                ? 'border-red-500/60 text-red-400'
                : dueToday(item.dueDate)
                  ? 'border-accent/60 text-accent'
                  : 'text-ink-400'}"
            />
          </form>
          {#if item.dueTime}<span class="text-ink-400">{item.dueTime}</span>{/if}
          {#if item.recur === 'weekly'}
            <span class="text-ink-500">every {DAYS[item.recurWeekday ?? 0]}</span>
          {/if}
          {#if overdue(item.dueDate)}<span class="text-red-400">overdue</span>{/if}
          {#if dueToday(item.dueDate)}<span class="text-accent">today</span>{/if}
        </div>
      </div>

      <form method="POST" action="?/drop" use:enhance>
        <input type="hidden" name="id" value={item.id} />
        <button type="submit" aria-label="Drop" class="px-1 text-ink-600 hover:text-red-400">×</button>
      </form>
    </li>
  {/snippet}

  {#if tasks.length}
    <h2 class="mt-7 text-xs font-semibold uppercase tracking-wide text-ink-400">Tasks</h2>
    <ul>{#each tasks as item (item.id)}{@render row(item)}{/each}</ul>
  {/if}

  {#if ideas.length}
    <h2 class="mt-7 text-xs font-semibold uppercase tracking-wide text-ink-400">Ideas</h2>
    <ul>{#each ideas as item (item.id)}{@render row(item)}{/each}</ul>
  {/if}

  {#if data.meetings.length}
    <h2 class="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-400">Meetings</h2>
    <ul class="mt-1">
      {#each data.meetings as m (m.id)}
        <li class="border-b border-ink-800 py-2">
          <a href={`${page.url.pathname}/m/${m.id}`} class="text-[15px] underline underline-offset-4"
            >{m.title}</a
          >
          {#if m.withWhom}<span class="text-xs text-ink-500"> · {m.withWhom}</span>{/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if !data.items.length}
    <p class="mt-8 text-center text-sm text-ink-400">Nothing on the list.</p>
  {/if}
</main>
