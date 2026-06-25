<script lang="ts">
  /**
   * Two-step visitor verification modal.
   *  Step 1 — collect name/email/phone, request OTP.
   *  Step 2 — collect 6-digit code, verify, set cookie, fire onVerified.
   *
   * No external state library; uses Svelte 5 runes.
   */

  type Props = {
    open: boolean
    onClose: () => void
    onVerified: () => void
  }

  let { open, onClose, onVerified }: Props = $props()

  let step = $state<'contact' | 'code'>('contact')
  let name = $state('')
  let email = $state('')
  let phone = $state('')
  let code = $state('')
  let submitting = $state(false)
  let errorMsg = $state<string | null>(null)
  let infoMsg = $state<string | null>(null)

  // Reset state whenever the modal opens fresh.
  $effect(() => {
    if (open) {
      step = 'contact'
      code = ''
      errorMsg = null
      infoMsg = null
    }
  })

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose()
  }

  async function requestOtp(event: SubmitEvent) {
    event.preventDefault()
    if (submitting) return
    errorMsg = null
    infoMsg = null
    submitting = true
    try {
      const res = await fetch('/api/visitor/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        if (res.status === 429) {
          errorMsg = data.error ?? 'Too many attempts. Try again in a bit.'
        } else {
          errorMsg = data.error ?? 'Could not send code. Check your info and try again.'
        }
        return
      }
      step = 'code'
      infoMsg = `We sent a code to ${email.trim().toLowerCase()}. Check your inbox (and spam folder).`
    } catch (err) {
      errorMsg = 'Network hiccup. Try again.'
    } finally {
      submitting = false
    }
  }

  async function verify(event: SubmitEvent) {
    event.preventDefault()
    if (submitting) return
    errorMsg = null
    submitting = true
    try {
      const res = await fetch('/api/visitor/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          code: code.trim(),
        }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        errorMsg = data.error ?? 'Invalid code.'
        return
      }
      onVerified()
    } catch {
      errorMsg = 'Network hiccup. Try again.'
    } finally {
      submitting = false
    }
  }

  function backToContact() {
    step = 'contact'
    errorMsg = null
    infoMsg = null
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    role="presentation"
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-sm"
    onclick={handleBackdropClick}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-title"
      class="w-full max-w-md rounded-2xl border border-ink-700 bg-ink-800 p-6 shadow-2xl"
    >
      <div class="mb-5">
        <h2 id="verify-title" class="text-lg font-semibold text-white">
          {step === 'contact' ? 'Talk to Daniel’s AI' : 'Enter your code'}
        </h2>
        <p class="mt-1 text-sm text-ink-300">
          {step === 'contact'
            ? 'Quick verify so Daniel knows who he talked to. Takes ~10 seconds.'
            : 'Six digits, valid for 10 minutes.'}
        </p>
      </div>

      {#if step === 'contact'}
        <form onsubmit={requestOtp} class="space-y-4">
          <div>
            <label class="label" for="v-name">Name</label>
            <input
              id="v-name"
              class="input"
              type="text"
              bind:value={name}
              required
              autocomplete="name"
              maxlength="100"
              placeholder="Your name"
            />
          </div>
          <div>
            <label class="label" for="v-email">Email</label>
            <input
              id="v-email"
              class="input"
              type="email"
              bind:value={email}
              required
              autocomplete="email"
              maxlength="254"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label class="label" for="v-phone">Phone</label>
            <input
              id="v-phone"
              class="input"
              type="tel"
              bind:value={phone}
              required
              autocomplete="tel"
              minlength="7"
              maxlength="32"
              placeholder="(555) 123-4567"
            />
            <p class="mt-1 text-[11px] text-ink-400">
              Any format. Used only so Daniel can follow up if useful.
            </p>
          </div>

          {#if errorMsg}
            <p class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errorMsg}
            </p>
          {/if}

          <p class="text-[11px] leading-relaxed text-ink-400">
            Your info is never shared. Used only so Daniel knows who he talked to.
          </p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-ghost" onclick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" class="btn-primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send me a code'}
            </button>
          </div>
        </form>
      {:else}
        <form onsubmit={verify} class="space-y-4">
          {#if infoMsg}
            <p class="rounded-md border border-ink-700 bg-ink-900/60 px-3 py-2 text-sm text-ink-200">
              {infoMsg}
            </p>
          {/if}

          <div>
            <label class="label" for="v-code">6-digit code</label>
            <input
              id="v-code"
              class="input text-center font-mono text-2xl tracking-[0.4em]"
              type="text"
              inputmode="numeric"
              pattern="\d{6}"
              bind:value={code}
              required
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="000000"
            />
          </div>

          {#if errorMsg}
            <p class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errorMsg}
            </p>
          {/if}

          <div class="flex items-center justify-between gap-2 pt-2">
            <button type="button" class="btn-ghost" onclick={backToContact} disabled={submitting}>
              Back
            </button>
            <button type="submit" class="btn-primary" disabled={submitting || code.length !== 6}>
              {submitting ? 'Verifying…' : 'Unlock chat'}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
