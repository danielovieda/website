/**
 * Deploy marker. Changed by hand on every deploy that needs verifying, then
 * polled at /push/<id> until it answers 200 — which proves the running build
 * is the one just pushed, not a cached or failed deploy still serving the old
 * bundle. A 404 means the new code is not live yet.
 */
export const BUILD_ID = 'kanjilv0007'
