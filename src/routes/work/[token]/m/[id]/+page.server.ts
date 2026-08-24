import { error, fail } from '@sveltejs/kit'
import { verifyWorkToken } from '$lib/server/work-token'
import {
  addAgendaItem,
  entryFor,
  getMeeting,
  history,
  nextOccurrence,
  setNotes,
  toggleAgendaItem,
} from '$lib/server/meetings'
import { addWork } from '$lib/server/work'
import type { Actions, PageServerLoad } from './$types'

/** Re-checked in every action: a successful load does not authorise a POST. */
function guard(token: string) {
  if (!verifyWorkToken(token)) throw error(404, 'Not found')
}

export const load: PageServerLoad = async ({ params }) => {
  guard(params.token)
  const meeting = await getMeeting(params.id)
  if (!meeting) throw error(404, 'Not found')

  // Make sure the upcoming occurrence exists so there is always somewhere to
  // type, even before anything has been added to it.
  const upcoming = nextOccurrence(meeting)
  await entryFor(meeting.id, upcoming)

  const entries = await history(meeting.id)
  return {
    meeting: {
      id: meeting.id,
      title: meeting.title,
      withWhom: meeting.withWhom,
      recur: meeting.recur,
      recurWeekday: meeting.recurWeekday,
      meetTime: meeting.meetTime ? meeting.meetTime.slice(0, 5) : null,
    },
    upcoming,
    entries: entries.map((e) => ({
      id: e.entry.id,
      meetsOn: e.entry.meetsOn,
      notes: e.entry.notes,
      agenda: e.agenda.map((a) => ({ id: a.id, body: a.body, discussed: a.discussed })),
      followUps: e.followUps.map((f) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        dueDate: f.dueDate,
      })),
    })),
  }
}

export const actions: Actions = {
  agenda: async ({ params, request }) => {
    guard(params.token)
    const body = String((await request.formData()).get('body') || '').trim()
    if (!body) return fail(400, { error: 'Say what to raise.' })
    await addAgendaItem(params.id, body.slice(0, 1000))
    return { added: true }
  },

  toggleAgenda: async ({ params, request }) => {
    guard(params.token)
    const id = String((await request.formData()).get('id') || '')
    if (!id) return fail(400, { error: 'Missing id.' })
    await toggleAgendaItem(id)
    return { toggled: true }
  },

  notes: async ({ params, request }) => {
    guard(params.token)
    const form = await request.formData()
    const entryId = String(form.get('entryId') || '')
    const notes = String(form.get('notes') || '')
    if (!entryId) return fail(400, { error: 'Missing entry.' })
    await setNotes(entryId, notes.slice(0, 20000))
    return { saved: true }
  },

  followUp: async ({ params, request }) => {
    guard(params.token)
    const form = await request.formData()
    const entryId = String(form.get('entryId') || '')
    const title = String(form.get('title') || '').trim()
    const dueDate = String(form.get('dueDate') || '')
    if (!entryId || !title) return fail(400, { error: 'Give the follow-up a title.' })
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return fail(400, { error: 'Bad date.' })
    // Lands on the main checklist and gets reminded about like anything else;
    // an action item that lives only in notes does not get done.
    await addWork({
      title: title.slice(0, 300),
      dueDate: dueDate || null,
      priority: 2,
      meetingEntryId: entryId,
    })
    return { followedUp: true }
  },
}
