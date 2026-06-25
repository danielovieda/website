import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 5173, strictPort: false },
  ssr: {
    // better-auth + better-call ship their own nested deps; keep external so
    // Node resolves them at runtime instead of bundling.
    external: ['better-auth', 'better-auth/svelte', 'better-call'],
    noExternal: ['lucide-svelte'],
  },
  resolve: { dedupe: ['zod'] },
})
