import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Hoist .env into process.env so server modules that read process.env at
  // module-load time (auth.ts, db/index.ts) see the values during dev/build.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v
  }

  return {
    plugins: [sveltekit()],
    server: { port: 5173, strictPort: false },
    ssr: {
      external: ['better-auth', 'better-auth/svelte', 'better-call'],
      noExternal: ['lucide-svelte'],
    },
    resolve: { dedupe: ['zod'] },
  }
})
