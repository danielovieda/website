/**
 * Trigger a full re-ingest of data/master.yaml.
 *
 * Auth: hooks.server.ts gates /api/admin/* to the admin user.
 * Runtime: can take several seconds; client should show a spinner.
 */

import { json, type RequestHandler } from '@sveltejs/kit'
import { runIngest } from '$lib/server/ingest/yaml-ingest'

export const POST: RequestHandler = async () => {
  try {
    const result = await runIngest()
    return json({ ok: true, result })
  } catch (err) {
    console.error('[ingest] failed', err)
    const message = err instanceof Error ? err.message : 'Ingest failed.'
    return json({ ok: false, error: message }, { status: 500 })
  }
}
