import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'
import { verifyWorkToken } from '$lib/server/work-token'
import { addWork, listWork, toggleWork, updateWork } from '$lib/server/work'
import type { Actions, PageServerLoad } from './$types'

/** Every action re-checks the token. The load succeeding does not authorise a
 *  later POST — form actions are separate requests and are hit directly. */
function guard(token: string) {
  if (!verifyWorkToken(token)) throw error(404, 'Not found')
}

export const load: PageServerLoad = async ({ params, url }) => {
  guard(params.token)
  const showDone = url.searchParams.get('done') === '1'
  const items = await listWork(showDone)
  return {
    showDone,
    today: new Date().toISOString().slice(0, 10),
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      notes: i.notes,
      kind: i.kind,
      status: i.status,
      priority: i.priority,
      dueDate: i.dueDate,
      dueTime: i.dueTime ? i.dueTime.slice(0, 5) : null,
      recur: i.recur,
      recurWeekday: i.recurWeekday,
    })),
  }
}

const AddBody = z.object({
  title: z.string().trim().min(1).max(300),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  kind: z.enum(['task', 'idea']).default('task'),
  priority: z.coerce.number().int().min(1).max(5).default(3),
  // An empty date field posts "", which must become NULL rather than a
  // parse error — most items genuinely have no deadline.
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
})

export const actions: Actions = {
  add: async ({ params, request }) => {
    guard(params.token)
    const form = await request.formData()
    const parsed = AddBody.safeParse(Object.fromEntries(form))
    if (!parsed.success) return fail(400, { error: 'Give it a title.' })
    await addWork({
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      kind: parsed.data.kind,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate || null,
    })
    return { added: true }
  },

  toggle: async ({ params, request }) => {
    guard(params.token)
    const id = String((await request.formData()).get('id') || '')
    if (!id) return fail(400, { error: 'Missing id.' })
    const row = await toggleWork(id)
    if (!row) return fail(404, { error: 'Gone.' })
    return { toggled: true }
  },

  due: async ({ params, request }) => {
    guard(params.token)
    const form = await request.formData()
    const id = String(form.get('id') || '')
    const raw = String(form.get('dueDate') || '')
    if (!id) return fail(400, { error: 'Missing id.' })
    if (raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return fail(400, { error: 'Bad date.' })
    await updateWork(id, { dueDate: raw || null })
    return { dated: true }
  },

  drop: async ({ params, request }) => {
    guard(params.token)
    const id = String((await request.formData()).get('id') || '')
    if (!id) return fail(400, { error: 'Missing id.' })
    await updateWork(id, { status: 'dropped' })
    return { dropped: true }
  },
}
