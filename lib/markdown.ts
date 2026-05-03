import type {
  ChangelogCategoryKey,
  ChangelogResult,
  ChangelogTone,
} from '@/types/changelog'

const CATEGORY_LABELS: Record<ChangelogCategoryKey, string> = {
  features: 'Features',
  bugFixes: 'Bug Fixes',
  improvements: 'Improvements',
  breakingChanges: 'Breaking Changes',
  chore: 'Chores',
}

const CATEGORY_ORDER: ChangelogCategoryKey[] = [
  'features',
  'bugFixes',
  'improvements',
  'breakingChanges',
  'chore',
]

export interface MarkdownDateRange {
  from?: Date | string | null
  to?: Date | string | null
}

export interface ChangelogMarkdownOptions {
  repoName: string
  generatedAt?: Date | string | null
  tone?: ChangelogTone
  commitCount?: number
  contributors?: string[]
  dateRange?: MarkdownDateRange
}

export function generateChangelogMarkdown(
  changelog: ChangelogResult,
  options: ChangelogMarkdownOptions
): string {
  const generatedAt = options.generatedAt
    ? new Date(options.generatedAt)
    : new Date()

  const lines: string[] = [
    `# Changelog - ${normalizeInlineText(options.repoName)}`,
    '',
    `**Date:** ${formatDate(generatedAt)}`,
    `**Generated:** ${formatDateTime(generatedAt)}`,
  ]

  if (options.tone) {
    lines.push(`**Tone:** ${formatTone(options.tone)}`)
  }

  if (typeof options.commitCount === 'number') {
    lines.push(`**Commits analyzed:** ${options.commitCount}`)
  }

  const contributors = uniqueNonEmpty(options.contributors)
  if (contributors.length > 0) {
    lines.push(`**Contributors:** ${contributors.join(', ')}`)
  }

  const dateRange = formatDateRange(options.dateRange)
  if (dateRange) {
    lines.push(`**Commit range:** ${dateRange}`)
  }

  lines.push('')

  const populatedCategories = CATEGORY_ORDER.filter(
    (category) => changelog[category].length > 0
  )

  if (populatedCategories.length === 0) {
    lines.push('No meaningful changes found.')
    return lines.join('\n')
  }

  for (const category of populatedCategories) {
    lines.push(`## ${CATEGORY_LABELS[category]}`, '')

    for (const entry of changelog[category]) {
      lines.push(`- **${normalizeInlineText(entry.title)}**`)
      lines.push(`  ${normalizeMultilineText(entry.description)}`)

      if (entry.commits.length > 0) {
        lines.push(
          `  - Commits: ${entry.commits
            .map((commit) => `\`${normalizeInlineText(commit)}\``)
            .join(', ')}`
        )
      }
    }

    lines.push('')
  }

  return lines.join('\n').trimEnd() + '\n'
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeMultilineText(value: string): string {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n  ')
}

function uniqueNonEmpty(values: string[] | undefined): string[] {
  if (!values) return []

  return Array.from(
    new Set(values.map((value) => normalizeInlineText(value)).filter(Boolean))
  )
}

function formatTone(tone: ChangelogTone): string {
  if (tone === 'user-friendly') return 'User-friendly'
  return tone.charAt(0).toUpperCase() + tone.slice(1)
}

function formatDateRange(dateRange: MarkdownDateRange | undefined): string | null {
  if (!dateRange?.from || !dateRange?.to) return null

  return `${formatDate(new Date(dateRange.from))} - ${formatDate(new Date(dateRange.to))}`
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatDateTime(date: Date): string {
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
