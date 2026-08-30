import { json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'
import { isAuthorized } from '$lib/server/jp-auth'
import { publishResearch } from '$lib/server/research'

const Body = z.object({
  ref: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  question: z.string().trim().min(1).max(4000),
  findings: z.string().trim().min(1).max(60000),
  videos: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(300),
        // Only real YouTube watch links. The runner verifies these resolve
        // before posting, but a model that fabricates a URL should not be able
        // to get an arbitrary link onto the page by calling it a video.
        url: z
          .string()
          .url()
          .max(500)
          .refine(
            (u) => /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(u),
            'must be a youtube.com/watch or youtu.be link'
          ),
      })
    )
    .max(10)
    .default([]),
  // 50,000 rather than a tight bound: this cap exists to catch nonsense, not
  // to encode an opinion about how long a job takes. It was 1,000 - fine for
  // pouring a slab, and it rejected a Japanese-study roadmap that legitimately
  // came back at 1,700 hours, losing a completed ten-minute research run to a
  // 400. A ceiling should only ever reject the absurd.
  estHours: z.number().positive().max(50000).nullable().default(null),
  verdict: z.string().trim().max(4000).nullable().default(null),
  project: z.string().trim().max(200).nullable().default(null),
})

/**
 * The house machine publishes verified research; it gets back the URL to put
 * in the summary email.
 *
 * Same bearer token as /api/jp — one shared secret for the one machine that
 * calls this site.
 */
export const POST: RequestHandler = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let parsed
  try {
    parsed = Body.parse(await request.json())
  } catch {
    return json({ ok: false, error: 'Invalid input' }, { status: 400 })
  }

  // Resolved before the write, matching /api/jp/day: a caller that gets a 500
  // sends no email, and must not be left with a published row it never linked.
  const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '')
  if (!base) {
    console.error('api/research: PUBLIC_SITE_URL is not configured')
    return json({ ok: false, error: 'Server is not configured to build links' }, { status: 500 })
  }

  try {
    const row = await publishResearch(parsed)
    return json({ ok: true, ref: row.ref, url: `${base}/research/${row.ref}` })
  } catch (err) {
    console.error('api/research: write failed:', err)
    return json({ ok: false, error: 'Could not publish the research' }, { status: 500 })
  }
}
