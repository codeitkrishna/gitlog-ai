import type {
  ChangelogCategoryKey,
  ChangelogEntry,
  ChangelogResult,
} from '@/types/changelog'

const CATEGORY_KEYS: ChangelogCategoryKey[] = [
  'features',
  'bugFixes',
  'improvements',
  'breakingChanges',
  'chore',
]

export function parseChangelogResponse(rawResponse: string): ChangelogResult {
  const jsonCandidate = extractJsonCandidate(rawResponse)
  const parsed = JSON.parse(jsonCandidate) as unknown

  return validateChangelogResult(parsed)
}

function extractJsonCandidate(rawResponse: string): string {
  const trimmedResponse = rawResponse.trim()

  if (!trimmedResponse) {
    throw new Error('AI returned an empty response.')
  }

  const fencedMatch = trimmedResponse.match(/```(?:json)?\s*([\s\S]*?)```/i)

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  const firstBrace = trimmedResponse.indexOf('{')
  const lastBrace = trimmedResponse.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('AI response did not include valid JSON content.')
  }

  return trimmedResponse.slice(firstBrace, lastBrace + 1)
}

function validateChangelogResult(value: unknown): ChangelogResult {
  if (!isRecord(value)) {
    throw new Error('AI response JSON must be an object.')
  }

  const result = createEmptyChangelog()

  for (const category of CATEGORY_KEYS) {
    const entries = value[category]

    if (entries === undefined) {
      continue
    }

    if (!Array.isArray(entries)) {
      throw new Error(`AI response field "${category}" must be an array.`)
    }

    result[category] = entries.map((entry, index) =>
      validateChangelogEntry(entry, category, index)
    )
  }

  return result
}

function validateChangelogEntry(
  value: unknown,
  category: ChangelogCategoryKey,
  index: number
): ChangelogEntry {
  if (!isRecord(value)) {
    throw new Error(`Entry ${index + 1} in "${category}" must be an object.`)
  }

  const { title, description, commits } = value

  if (typeof title !== 'string' || !title.trim()) {
    throw new Error(`Entry ${index + 1} in "${category}" is missing a valid title.`)
  }

  if (typeof description !== 'string' || !description.trim()) {
    throw new Error(`Entry ${index + 1} in "${category}" is missing a valid description.`)
  }

  if (!Array.isArray(commits) || !commits.every((commit) => typeof commit === 'string')) {
    throw new Error(`Entry ${index + 1} in "${category}" must include a string[] commits field.`)
  }

  return {
    title: title.trim(),
    description: description.trim(),
    commits: Array.from(new Set(commits.map((commit) => commit.trim()).filter(Boolean))),
  }
}

function createEmptyChangelog(): ChangelogResult {
  return {
    features: [],
    bugFixes: [],
    improvements: [],
    breakingChanges: [],
    chore: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
