export interface GitHubRepository {
  id: number
  node_id: string
  name: string
  full_name: string
  description: string | null
  private: boolean
  owner: {
    login: string
    avatar_url: string
    [key: string]: unknown
  }
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string | null  // ← Changed to allow null
  created_at: string
  topics?: string[]
  default_branch: string
  [key: string]: unknown
}

// Simplified repo type for our UI
export interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  owner: string
  language: string | null
  stars: number
  updatedAt: string | null  // ← Changed to allow null
  isPrivate: boolean
  url: string
}

export interface Tag {
  name: string
  sha: string
}

export interface CommitData {
  sha: string
  shortSha: string
  message: string
  author: string
  date: string
  filesChanged: string[]
  additions: number
  deletions: number
}