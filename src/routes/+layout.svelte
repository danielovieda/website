<script lang="ts">
  import '../app.css'

  let { children } = $props()
</script>

<svelte:head>
  <title>Daniel Ovieda — interactive resume</title>
</svelte:head>

{@render children?.()}
