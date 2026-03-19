import { Octokit } from '@octokit/rest'
import type { GitHubRepository, Repository } from '@/types/github'

/**
 * Create authenticated Octokit instance
 * @param accessToken - GitHub access token from user session
 */
export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
  })
}

/**
 * Fetch all repositories for authenticated user
 * @param accessToken - GitHub access token
 * @returns Array of repositories
 */
export async function getUserRepositories(
  accessToken: string
): Promise<Repository[]> {
  const octokit = createGitHubClient(accessToken)

  try {
    console.log('Fetching repos with token:', accessToken.substring(0, 10) + '...')
    
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
    })

    console.log('Successfully fetched', data.length, 'repos')

    const repos: Repository[] = data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      owner: repo.owner.login,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at || repo.created_at,
      isPrivate: repo.private,
      url: repo.html_url,
    }))

    return repos
  } catch (error) {
    console.error('GitHub API Error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error('Failed to fetch repositories from GitHub')
  }
}

/**
 * Get repository details by owner and name
 * @param accessToken - GitHub access token
 * @param owner - Repository owner
 * @param repo - Repository name
 */
export async function getRepository(
  accessToken: string,
  owner: string,
  repo: string
) {
  const octokit = createGitHubClient(accessToken)

  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    })

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      owner: data.owner.login,
      language: data.language,
      stars: data.stargazers_count,
      updatedAt: data.updated_at,
      isPrivate: data.private,
      url: data.html_url,
    }
  } catch (error) {
    console.error('Error fetching repository:', error)
    throw new Error('Repository not found')
  }
}