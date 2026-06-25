<script lang="ts">
  /**
   * Chat panel — wraps the @ai-sdk/svelte Chat class against a streaming
   * UIMessage endpoint (defaults to /api/chat). Renders markdown for assistant
   * turns, auto-scrolls, and shows quick suggested prompts on first load.
   *
   * Pass `quickPrompts` to override the default list; pass `endpoint` to point at
   * a different streaming chat handler (used by /admin/training).
   */

  import { Chat } from '@ai-sdk/svelte'
  import { DefaultChatTransport } from 'ai'
  import { marked } from 'marked'

  type Props = {
    endpoint?: string
    quickPrompts?: string[]
    placeholder?: string
    onAssistantTurn?: (text: string) => void
  }

  let {
    endpoint = '/api/chat',
    quickPrompts = [
      "Tell me about RefriTrak",
      "What's your AI experience?",
      'Why operations + engineering?',
    ],
    placeholder = "Ask anything about Daniel’s work…",
    onAssistantTurn,
  }: Props = $props()

  let input = $state('')
  let listEl: HTMLDivElement | null = $state(null)
  let lastSeenAssistantId = $state<string | null>(null)

  // Pass `api` by reference so prop changes flow through to the transport.
  const chat = new Chat({
    transport: new DefaultChatTransport({
      get api() {
        return endpoint
      },
    }),
  })

  marked.setOptions({ gfm: true, breaks: true })

  function renderMarkdown(text: string): string {
    return marked.parse(text) as string
  }

  function partsToText(parts: { type: string; text?: string }[] | undefined): string {
    if (!parts) return ''
    return parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('')
  }

  function submit(text: string) {
    const t = text.trim()
    if (!t) return
    chat.sendMessage({ text: t })
    input = ''
  }

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    submit(input)
  }

  function handlePromptClick(p: string) {
    submit(p)
  }

  // Auto-scroll the message list whenever new content arrives.
  $effect(() => {
    // touch reactive deps
    void chat.messages.length
    const last = chat.messages[chat.messages.length - 1]
    void (last ? partsToText(last.parts as { type: string; text?: string }[]).length : 0)
    queueMicrotask(() => {
      if (listEl) listEl.scrollTop = listEl.scrollHeight
    })
  })

  // Fire onAssistantTurn when the latest assistant message finishes streaming.
  $effect(() => {
    if (chat.status === 'streaming' || chat.status === 'submitted') return
    const last = chat.messages[chat.messages.length - 1]
    if (!last || last.role !== 'assistant') return
    if (last.id === lastSeenAssistantId) return
    const text = partsToText(last.parts as { type: string; text?: string }[])
    if (!text.trim()) return
    lastSeenAssistantId = last.id
    onAssistantTurn?.(text)
  })

  const showQuickPrompts = $derived(chat.messages.length === 0 && quickPrompts.length > 0)
  const busy = $derived(chat.status === 'submitted' || chat.status === 'streaming')
</script>

<div class="flex h-full min-h-[480px] flex-col">
  <div
    bind:this={listEl}
    class="scrollbar-subtle flex-1 space-y-4 overflow-y-auto pr-1"
    aria-live="polite"
  >
    {#if chat.messages.length === 0}
      <div class="rounded-lg border border-dashed border-ink-700 bg-ink-800/30 p-5 text-sm text-ink-300">
        Daniel’s AI answers based on his resume and curated answers. It speaks about Daniel in
        third person and won’t make things up.
      </div>
    {/if}

    {#each chat.messages as message (message.id)}
      {@const isUser = message.role === 'user'}
      {@const text = partsToText(message.parts as { type: string; text?: string }[])}
      <div class={isUser ? 'flex justify-end' : 'flex justify-start'}>
        <div
          class={isUser
            ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-white shadow-sm'
            : 'max-w-[90%] rounded-2xl rounded-bl-sm border border-ink-700/60 bg-ink-800/60 px-4 py-3 text-sm shadow-sm'}
        >
          {#if isUser}
            <p class="whitespace-pre-wrap leading-relaxed">{text}</p>
          {:else}
            <div class="prose-chat text-sm">{@html renderMarkdown(text)}</div>
          {/if}
        </div>
      </div>
    {/each}

    {#if busy && (chat.messages.length === 0 || chat.messages[chat.messages.length - 1]?.role === 'user')}
      <div class="flex justify-start">
        <div class="rounded-2xl rounded-bl-sm border border-ink-700/60 bg-ink-800/60 px-4 py-3 text-sm">
          <span class="inline-flex gap-1">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-300"></span>
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-300 [animation-delay:120ms]"
            ></span>
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-300 [animation-delay:240ms]"
            ></span>
          </span>
        </div>
      </div>
    {/if}

    {#if chat.error}
      <div class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {chat.error.message ?? 'Something went wrong. Try again.'}
      </div>
    {/if}
  </div>

  {#if showQuickPrompts}
    <div class="mt-3 flex flex-wrap gap-2">
      {#each quickPrompts as p (p)}
        <button
          type="button"
          class="chip transition-colors hover:border-accent hover:text-accent"
          onclick={() => handlePromptClick(p)}
        >
          {p}
        </button>
      {/each}
    </div>
  {/if}

  <form onsubmit={onSubmit} class="mt-3 flex items-end gap-2">
    <textarea
      class="input min-h-[44px] resize-none"
      rows="1"
      bind:value={input}
      {placeholder}
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          submit(input)
        }
      }}
    ></textarea>
    <button type="submit" class="btn-primary" disabled={busy || !input.trim()}>
      {busy ? 'Sending…' : 'Send'}
    </button>
  </form>
</div>
