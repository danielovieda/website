<script lang="ts">
  import { Sun, Moon } from 'lucide-svelte'

  const STORAGE_KEY = 'do-theme'
  const LIGHT = 'mocha' as const
  const DARK = 'midnight' as const
  type Theme = typeof LIGHT | typeof DARK

  let theme = $state<Theme>(LIGHT)

  $effect(() => {
    // Read persisted preference, then fall back to OS preference.
    // $effect only runs on the client, so window / localStorage are safe here.
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const resolved: Theme =
      stored === LIGHT || stored === DARK
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? DARK
          : LIGHT

    document.documentElement.setAttribute('data-theme', resolved)
    theme = resolved
  })

  function toggle() {
    const next: Theme = theme === DARK ? LIGHT : DARK
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.setAttribute('data-theme', next)
    theme = next
  }
</script>

<!--
  Positioning is the caller's responsibility.
  Renders Sun when dark (midnight), Moon when light (mocha).
-->
<button class="btn btn-ghost btn-circle" onclick={toggle} aria-label="Toggle theme">
  {#if theme === DARK}
    <Sun size={20} />
  {:else}
    <Moon size={20} />
  {/if}
</button>
