import { auth } from '$lib/server/auth'
import type { RequestHandler } from './$types'

// Catch-all proxy so better-auth's internal router handles every /api/auth/* path.
export const GET: RequestHandler = ({ request }) => auth.handler(request)
export const POST: RequestHandler = ({ request }) => auth.handler(request)
