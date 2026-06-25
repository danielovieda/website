import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'sveltekit',
  // Lambda regions — keep close to Neon Postgres primary.
  regions: ['iad1'],
}
