import type { CommitData } from '@/types/github'

export type ChangelogTone = 'technical' | 'user-friendly' | 'marketing'

export type ChangelogCategoryKey =
  | 'features'
  | 'bugFixes'
  | 'improvements'
  | 'breakingChanges'
  | 'chore'

export interface ChangelogEntry {
  title: string
  description: string
  commits: string[]
}

export interface ChangelogResult {
  features: ChangelogEntry[]
  bugFixes: ChangelogEntry[]
  improvements: ChangelogEntry[]
  breakingChanges: ChangelogEntry[]
  chore: ChangelogEntry[]
}

export interface GenerateChangelogRequestBody {
  commits: CommitData[]
  tone: ChangelogTone
  owner?: string
  repo?: string
  repoName?: string
}
