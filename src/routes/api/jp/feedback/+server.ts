import { json, type RequestHandler } from '@sveltejs/kit'
import { isAuthorized } from '$lib/server/jp-auth'
import { takeFeedback } from '$lib/server/jp'

/**
 * The house machine claims every answered-but-unconsumed survey response.
 *
 * POST, not GET, because it mutates: claiming marks rows consumed. A GET that
 * changes state invites exactly the thing that destroys data here — a proxy,
 * a prefetch or a retrying client replaying it and silently burning a day's
 * grade with no error surfaced anywhere. The caller is a script, so nothing is
 * lost by requiring POST.
 *
 * Call it once per morning, at the point the schedule is about to be updated.
 * Never call it to browse; query jp_days directly for that.
 */
export const POST: RequestHandler = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await takeFeedback()
    return json(
      {
        ok: true,
        feedback: rows.map((r) => ({
          dayN: r.dayN,
          word: r.word,
          difficulty: r.difficulty,
          alreadyKnew: r.alreadyKnew,
          missedReviews: r.missedReviews,
          note: r.note,
          respondedAt: r.respondedAt,
        })),
      },
      { headers: { 'cache-control': 'no-store' } }
    )
  } catch (err) {
    console.error('jp/feedback: read failed:', err)
    return json({ ok: false, error: 'Could not read feedback' }, { status: 500 })
  }
}
