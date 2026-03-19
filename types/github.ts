// // Repository type based on GitHub API response
// export interface GitHubRepository {
//   id: number
//   name: string
//   full_name: string // "username/repo-name"
//   description: string | null
//   private: boolean
//   owner: {
//     login: string
//     avatar_url: string
//   }
//   html_url: string
//   language: string | null
//   stargazers_count: number
//   forks_count: number
//   updated_at: string
//   created_at: string
//   topics: string[]
//   default_branch: string
// }

// // Simplified repo type for our UI (we don't need all fields)
// export interface Repository {
//   id: number
//   name: string
//   fullName: string
//   description: string | null
//   owner: string
//   language: string | null
//   stars: number
//   updatedAt: string
//   isPrivate: boolean
//   url: string
// }

// // API response type
// export interface GitHubReposResponse {
//   repos: Repository[]
//   total: number
// }

// GitHub API response type (what GitHub actually returns)
// GitHub API response type (what GitHub actually returns)
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