/**
 * Public landing page server load.
 *
 * Reads data/master.yaml via the cached resume loader and shapes a small,
 * read-only payload for the landing page. No DB calls — the landing page is
 * static-from-YAML; the chat is the only DB-touching surface.
 */

import { loadResume } from '$lib/server/resume'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const resume = loadResume()

  const topExperience = resume.experience.slice(0, 4).map((e) => ({
    company: e.company,
    title: e.title,
    location: e.location ?? null,
    start: e.start,
    end: e.end,
    tags: e.tags ?? [],
    tech: e.tech ?? [],
    highlights: e.highlights.slice(0, 3),
  }))

  // Flatten skills into a tag-cloud-friendly list, capped so it doesn't sprawl.
  const skillTags: string[] = []
  for (const items of Object.values(resume.skills ?? {})) {
    for (const item of items) {
      if (skillTags.length >= 36) break
      skillTags.push(item)
    }
    if (skillTags.length >= 36) break
  }

  return {
    name: resume.contact?.name ?? 'Daniel Ovieda',
    location: resume.contact?.location ?? null,
    summary: resume.summary,
    topExperience,
    skillTags,
  }
}
