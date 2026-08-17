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
    placeholder = "Ask anything about Daniel's work…",
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

<div class="flex min-h-[480px] flex-1 flex-col">
  <!-- Message list wrapper — provides positioning context for the top fade -->
  <div class="relative flex-1 min-h-0">
    <!-- Top fade — gradient overlay above the scrolling content -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-base-100 to-transparent"
      aria-hidden="true"
    ></div>

    <!-- Message list -->
    <div
      bind:this={listEl}
      class="scrollbar-subtle absolute inset-0 overflow-y-auto pr-1"
      aria-live="polite"
    >
    {#if chat.messages.length === 0}
      <div class="rounded-lg border border-base-300 bg-base-200 p-5 text-sm text-base-content/70">
        This AI answers as Daniel, in first person, based on his resume and curated answers.
        It won't make things up — if it doesn't know, it'll say so.
      </div>
    {/if}

    {#each chat.messages as message (message.id)}
      {@const isUser = message.role === 'user'}
      {@const text = partsToText(message.parts as { type: string; text?: string }[])}
      <div class={isUser ? 'chat chat-end' : 'chat chat-start'}>
        <div
          class={isUser
            ? 'chat-bubble bg-primary/80 text-primary-content'
            : 'chat-bubble bg-base-200/80 text-base-content'}
        >
          {#if isUser}
            <p class="whitespace-pre-wrap leading-relaxed text-sm">{text}</p>
          {:else}
            <div class="prose-chat text-sm">{@html renderMarkdown(text)}</div>
          {/if}
        </div>
      </div>
    {/each}

    {#if busy && (chat.messages.length === 0 || chat.messages[chat.messages.length - 1]?.role === 'user')}
      <div class="chat chat-start">
        <div class="chat-bubble bg-base-200/80 text-base-content">
          <span class="loading loading-dots loading-sm"></span>
        </div>
      </div>
    {/if}

    {#if chat.error}
      <div role="alert" class="alert alert-error mt-2 py-2 text-sm">
        <span>{chat.error.message ?? 'Something went wrong. Try again.'}</span>
      </div>
    {/if}
    </div>
  </div>

  <!-- Quick-start prompts — shown before first message -->
  {#if showQuickPrompts}
    <div class="mt-3 flex flex-wrap gap-2">
      {#each quickPrompts as p (p)}
        <button
          type="button"
          class="btn btn-xs btn-outline btn-primary"
          onclick={() => handlePromptClick(p)}
        >
          {p}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Input area -->
  <form onsubmit={onSubmit} class="join mt-3 w-full items-end">
    <textarea
      class="textarea textarea-bordered join-item min-h-[44px] flex-1 resize-none leading-relaxed"
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
    <button
      type="submit"
      class="btn btn-primary join-item self-end"
      disabled={busy || !input.trim()}
    >
      {#if busy}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        Send
      {/if}
    </button>
  </form>
</div>
