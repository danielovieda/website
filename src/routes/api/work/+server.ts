import { json, type RequestHandler } from '@sveltejs/kit'
import { isAuthorized } from '$lib/server/jp-auth'
import { workForReminder } from '$lib/server/work'
import { signWorkToken } from '$lib/server/work-token'

/**
 * What the house machine reads to build its weekday reminders.
 *
 * It also returns the current signed link, so the NUC never has to hold
 * WORK_LINK_SECRET — same reasoning as /api/jp/day minting the survey URL:
 * the signing key stays on Vercel, and bumping WORK_LINK_ROTATION revokes
 * every previously emailed link without touching the house machine at all.
 */
export const GET: RequestHandler = async ({ request }) => {
  if (!isAuthorized(request)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '')
  if (!base) {
    console.error('api/work: PUBLIC_SITE_URL is not configured')
    return json({ ok: false, error: 'Server is not configured to build links' }, { status: 500 })
  }

  // Resolved BEFORE the read, matching /api/jp/day: a caller that gets a 500
  // sends no reminder, and "could not read the work list" would be a lie when
  // the real problem is an unset signing key. This is the first thing that
  // breaks on a fresh deploy, so it says so.
  let url: string
  try {
    url = `${base}/work/${signWorkToken()}`
  } catch (err) {
    console.error('api/work: cannot sign the work link:', err)
    return json(
      { ok: false, error: 'WORK_LINK_SECRET is not configured on this deployment' },
      { status: 500 }
    )
  }

  try {
    const { open, overdue, dueToday } = await workForReminder()
    const slim = (i: (typeof open)[number]) => ({
      id: i.id,
      title: i.title,
      notes: i.notes,
      kind: i.kind,
      priority: i.priority,
      dueDate: i.dueDate,
      dueTime: i.dueTime ? i.dueTime.slice(0, 5) : null,
      recur: i.recur,
    })
    return json({
      ok: true,
      url,
      counts: { open: open.length, overdue: overdue.length, dueToday: dueToday.length },
      open: open.map(slim),
      overdue: overdue.map(slim),
      dueToday: dueToday.map(slim),
    })
  } catch (err) {
    console.error('api/work: read failed:', err)
    return json({ ok: false, error: 'Could not read the work list' }, { status: 500 })
  }
}
