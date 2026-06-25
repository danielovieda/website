/**
 * Resume data loader.
 *
 * Reads data/master.yaml and shapes it for both:
 *   - the public landing page (read-only summary view)
 *   - the ingest pipeline (chunking for embeddings)
 *
 * Schema follows resume-builder's master.yaml format. Treat unknown fields as
 * optional rather than throwing — the YAML is the owner's source of truth and
 * may grow over time.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import YAML from 'yaml'

export interface ContactLink {
  label: string
  url: string
}

export interface Contact {
  name: string
  email: string
  phone: string
  location: string
  links: ContactLink[]
}

export interface ExperienceEntry {
  company: string
  title: string
  location?: string
  start: string
  end: string
  tags?: string[]
  tech?: string[]
  highlights: string[]
}

export interface ProjectEntry {
  name: string
  description?: string
  tech?: string[]
  tags?: string[]
  highlights: string[]
}

export interface EducationEntry {
  school: string
  degree?: string
  location?: string
  start?: string
  end?: string
  highlights?: string[]
}

export interface ResumeData {
  contact: Contact
  summary: string
  experience: ExperienceEntry[]
  projects?: ProjectEntry[]
  skills?: Record<string, string[]>
  education?: EducationEntry[]
  certifications?: Array<string | { name: string; issuer?: string; year?: string }>
  raw: unknown
}

let cached: ResumeData | null = null

export function loadResume(): ResumeData {
  if (cached) return cached
  const path = join(process.cwd(), 'data', 'master.yaml')
  const text = readFileSync(path, 'utf8')
  const parsed = YAML.parse(text) as Record<string, unknown>

  const contact = (parsed.contact ?? {}) as Contact
  const summary = (parsed.summary as string | undefined)?.trim() ?? ''
  const experience = ((parsed.experience as ExperienceEntry[] | undefined) ?? []).map((e) => ({
    ...e,
    highlights: e.highlights ?? [],
  }))
  const projects = (parsed.projects as ProjectEntry[] | undefined) ?? []
  const skills = (parsed.skills as Record<string, string[]> | undefined) ?? {}
  const education = (parsed.education as EducationEntry[] | undefined) ?? []
  const certifications = (parsed.certifications as ResumeData['certifications']) ?? []

  cached = {
    contact,
    summary,
    experience,
    projects,
    skills,
    education,
    certifications,
    raw: parsed,
  }
  return cached
}

export function clearResumeCache(): void {
  cached = null
}

// -------- Chunking ----------------------------------------------------------

export interface ResumeChunk {
  /** Stable source key — used as upsert key. */
  source: string
  content: string
  metadata: Record<string, unknown>
}

/**
 * Break the resume into small, retrieval-sized chunks. Each chunk has a stable
 * `source` so re-ingest is idempotent (matches → updated; new → inserted; missing
 * sources are deleted).
 */
export function chunkResume(resume: ResumeData): ResumeChunk[] {
  const chunks: ResumeChunk[] = []

  // Summary
  if (resume.summary) {
    chunks.push({
      source: 'yaml:summary',
      content: `Summary about Daniel Ovieda:\n${resume.summary}`,
      metadata: { kind: 'summary' },
    })
  }

  // Experience — header + each highlight as its own chunk
  resume.experience.forEach((exp, i) => {
    const header = formatExperienceHeader(exp)
    chunks.push({
      source: `yaml:experience[${i}].header`,
      content: header,
      metadata: { kind: 'experience-header', company: exp.company, title: exp.title },
    })
    exp.highlights.forEach((h, j) => {
      chunks.push({
        source: `yaml:experience[${i}].highlights[${j}]`,
        content: `${exp.company} (${exp.title}, ${exp.start}–${exp.end}): ${h}`,
        metadata: {
          kind: 'experience-highlight',
          company: exp.company,
          title: exp.title,
          tags: exp.tags ?? [],
        },
      })
    })
  })

  // Projects
  ;(resume.projects ?? []).forEach((p, i) => {
    const header = `Project: ${p.name}. ${p.description ?? ''}${p.tech?.length ? ` Tech: ${p.tech.join(', ')}.` : ''}`
    chunks.push({
      source: `yaml:projects[${i}].header`,
      content: header,
      metadata: { kind: 'project-header', name: p.name },
    })
    ;(p.highlights ?? []).forEach((h, j) => {
      chunks.push({
        source: `yaml:projects[${i}].highlights[${j}]`,
        content: `Project ${p.name}: ${h}`,
        metadata: { kind: 'project-highlight', name: p.name, tags: p.tags ?? [] },
      })
    })
  })

  // Skills — one chunk per category (keeps embeddings cohesive)
  for (const [category, items] of Object.entries(resume.skills ?? {})) {
    if (!items?.length) continue
    chunks.push({
      source: `yaml:skills.${category}`,
      content: `Skills (${category.replace(/_/g, ' ')}): ${items.join('; ')}`,
      metadata: { kind: 'skills', category },
    })
  }

  // Education
  ;(resume.education ?? []).forEach((ed, i) => {
    const text = [ed.degree, ed.school, ed.location, ed.start && ed.end ? `${ed.start}–${ed.end}` : null]
      .filter(Boolean)
      .join(' · ')
    chunks.push({
      source: `yaml:education[${i}]`,
      content: `Education: ${text}${ed.highlights?.length ? ` Highlights: ${ed.highlights.join(' ')}` : ''}`,
      metadata: { kind: 'education', school: ed.school },
    })
  })

  // Certifications
  ;(resume.certifications ?? []).forEach((c, i) => {
    const text = typeof c === 'string' ? c : [c.name, c.issuer, c.year].filter(Boolean).join(', ')
    chunks.push({
      source: `yaml:certifications[${i}]`,
      content: `Certification: ${text}`,
      metadata: { kind: 'certification' },
    })
  })

  return chunks
}

function formatExperienceHeader(exp: ExperienceEntry): string {
  const techLine = exp.tech?.length ? ` Tech: ${exp.tech.join(', ')}.` : ''
  const loc = exp.location ? ` (${exp.location})` : ''
  return `${exp.title} at ${exp.company}${loc} from ${exp.start} to ${exp.end}.${techLine}`
}
