<script lang="ts">
  import { goto } from '$app/navigation'
  import { authClient } from '$lib/auth-client'
  import type { PageData } from './$types'

  type Props = { data: PageData }
  let { data }: Props = $props()

  // If no user has been created yet AND the form email matches ADMIN_EMAIL,
  // first submission becomes a sign-up. Otherwise, sign-in.
  // These are one-shot form seeds — the user immediately types over them. The
  // state_referenced_locally warning is acceptable here.
  // svelte-ignore state_referenced_locally
  let mode = $state<'signin' | 'signup'>(data.hasAnyUser ? 'signin' : 'signup')
  // svelte-ignore state_referenced_locally
  let email = $state<string>(data.adminEmail)
  let password = $state('')
  let name = $state('Daniel Ovieda')
  let busy = $state(false)
  let errorMsg = $state<string | null>(null)

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (busy) return
    busy = true
    errorMsg = null

    try {
      if (mode === 'signup') {
        const res = await authClient.signUp.email({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || 'Admin',
        })
        if (res.error) {
          errorMsg = res.error.message ?? 'Sign-up failed.'
          return
        }
      } else {
        const res = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
        })
        if (res.error) {
          errorMsg = res.error.message ?? 'Sign-in failed.'
          return
        }
      }
      await goto('/admin/dashboard', { invalidateAll: true })
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Something went wrong.'
    } finally {
      busy = false
    }
  }
</script>

<main class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
  <div class="card">
    <h1 class="text-xl font-semibold text-white">
      {mode === 'signup' ? 'Create admin account' : 'Admin sign in'}
    </h1>
    <p class="mt-1 text-sm text-ink-300">
      {mode === 'signup'
        ? 'First-time setup. Only the configured admin email can sign up.'
        : 'Single-admin site. Email + password.'}
    </p>

    <form onsubmit={onSubmit} class="mt-6 space-y-4">
      {#if mode === 'signup'}
        <div>
          <label class="label" for="a-name">Name</label>
          <input id="a-name" class="input" type="text" bind:value={name} required />
        </div>
      {/if}
      <div>
        <label class="label" for="a-email">Email</label>
        <input
          id="a-email"
          class="input"
          type="email"
          bind:value={email}
          required
          autocomplete="email"
        />
      </div>
      <div>
        <label class="label" for="a-password">Password</label>
        <input
          id="a-password"
          class="input"
          type="password"
          bind:value={password}
          required
          autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minlength="8"
        />
      </div>

      {#if errorMsg}
        <p class="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMsg}
        </p>
      {/if}

      <button type="submit" class="btn-primary w-full" disabled={busy}>
        {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>

      {#if !data.hasAnyUser && mode === 'signin'}
        <p class="text-center text-xs text-ink-400">
          <button type="button" class="underline" onclick={() => (mode = 'signup')}>
            First time? Create the admin account.
          </button>
        </p>
      {/if}
    </form>
  </div>

  <p class="mt-6 text-center text-xs text-ink-500">
    <a href="/" class="hover:text-ink-300">← back to site</a>
  </p>
</main>
