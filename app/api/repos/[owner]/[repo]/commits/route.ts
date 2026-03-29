import { createClient } from '@/lib/supabase/server'
import { createGitHubClient } from '@/lib/github'
import { NextResponse } from 'next/server'
import type { CommitData } from '@/types/github'

interface RouteParams {
  params: Promise<{ owner: string; repo: string }>
}

interface CommitRequestBody {
  since?: string
  until?: string
  fromTag?: string
  toTag?: string
  excludeMergeCommits?: boolean
  excludeDependencyUpdates?: boolean
  excludeContaining?: string
}

const MAX_COMMITS = 500

const DEPENDENCY_PATTERNS = [
  /^(chore|fix|build)\(deps\)/i,
  /^bump /i,
  /^update .* to v?\d/i,
  /^upgrade /i,
  /dependabot/i,
  /^(chore|fix): update dependencies/i,
]

const isMergeCommit = (message: string) =>
  /^merge (branch|pull request|remote)/i.test(message)

const isDependencyCommit = (message: string) =>
  DEPENDENCY_PATTERNS.some((pattern) => pattern.test(message))

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('provider', 'github')
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'GitHub token not found' }, { status: 400 })
    }

    const { owner, repo } = await params
    const octokit = createGitHubClient(tokenData.access_token)
    const body: CommitRequestBody = await request.json()

    // Edge case: validate date range
    if (body.since && body.until) {
      const sinceDate = new Date(body.since)
      const untilDate = new Date(body.until)
      if (sinceDate >= untilDate) {
        return NextResponse.json(
          { error: 'Invalid date range', message: '"From" date must be before "To" date.' },
          { status: 400 }
        )
      }
    }

    let since: string | undefined
    let until: string | undefined

    if (body.since && body.until) {
      since = body.since
      until = body.until
    } else if (body.fromTag && body.toTag) {
      const resolveTagToCommitDate = async (tagName: string) => {
        const ref = await octokit.git.getRef({ owner, repo, ref: `tags/${tagName}` })
        const sha = ref.data.object.sha
        const type = ref.data.object.type
        if (type === 'tag') {
          const tagObject = await octokit.git.getTag({ owner, repo, tag_sha: sha })
          const commit = await octokit.repos.getCommit({ owner, repo, ref: tagObject.data.object.sha })
          return commit.data.commit.author?.date
        }
        const commit = await octokit.repos.getCommit({ owner, repo, ref: sha })
        return commit.data.commit.author?.date
      }

      const [sinceDate, untilDate] = await Promise.all([
        resolveTagToCommitDate(body.fromTag),
        resolveTagToCommitDate(body.toTag),
      ])
      since = sinceDate
      until = untilDate
    } else {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Provide either since+until dates or fromTag+toTag.' },
        { status: 400 }
      )
    }

    // Fetch commits with pagination
    const allCommits: CommitData[] = []
    let page = 1
    let hasMore = true

    while (hasMore && allCommits.length < MAX_COMMITS) {
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        since,
        until,
        per_page: 100,
        page,
      })

      if (commits.length === 0) {
        hasMore = false
        break
      }

      const commitsWithFiles = await Promise.all(
        commits.map(async (commit) => {
          try {
            const { data: detail } = await octokit.repos.getCommit({ owner, repo, ref: commit.sha })
            return {
              sha: commit.sha,
              shortSha: commit.sha.substring(0, 7),
              message: commit.commit.message,
              author: commit.commit.author?.name || 'Unknown',
              date: commit.commit.author?.date || '',
              filesChanged: detail.files?.map((f) => f.filename) || [],
              additions: detail.stats?.additions || 0,
              deletions: detail.stats?.deletions || 0,
            }
          } catch {
            return {
              sha: commit.sha,
              shortSha: commit.sha.substring(0, 7),
              message: commit.commit.message,
              author: commit.commit.author?.name || 'Unknown',
              date: commit.commit.author?.date || '',
              filesChanged: [],
              additions: 0,
              deletions: 0,
            }
          }
        })
      )

      allCommits.push(...commitsWithFiles)
      if (commits.length < 100) hasMore = false
      else page++
    }

    // Edge case: empty repo or no commits in range
    if (allCommits.length === 0) {
      return NextResponse.json(
        {
          commits: [],
          total: 0,
          wasTruncated: false,
          stats: null,
          message: 'No commits found in this range. Try a different date or tag range.',
        },
        { status: 200 }
      )
    }

    // Apply filters
    let filtered = [...allCommits]

    if (body.excludeMergeCommits) {
      filtered = filtered.filter((c) => !isMergeCommit(c.message))
    }

    if (body.excludeDependencyUpdates) {
      filtered = filtered.filter((c) => !isDependencyCommit(c.message))
    }

    if (body.excludeContaining?.trim()) {
      const term = body.excludeContaining.trim().toLowerCase()
      filtered = filtered.filter((c) => !c.message.toLowerCase().includes(term))
    }

    // Truncate very long commit messages
    filtered = filtered.map((c) => ({
      ...c,
      message: c.message.length > 500 ? c.message.substring(0, 500) + '...' : c.message,
    }))

    // Compute stats (Task 5.11)
    const contributors = [...new Set(filtered.map((c) => c.author))]
    const totalAdditions = filtered.reduce((sum, c) => sum + c.additions, 0)
    const totalDeletions = filtered.reduce((sum, c) => sum + c.deletions, 0)
    const totalFilesChanged = new Set(filtered.flatMap((c) => c.filesChanged)).size
    const dates = filtered.map((c) => new Date(c.date)).filter((d) => !isNaN(d.getTime()))
    const earliestDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null
    const latestDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null

    const stats = {
      total: filtered.length,
      contributors: contributors.length,
      contributorNames: contributors.slice(0, 5),
      totalFilesChanged,
      totalAdditions,
      totalDeletions,
      earliestDate: earliestDate?.toISOString() || null,
      latestDate: latestDate?.toISOString() || null,
      filteredOut: allCommits.length - filtered.length,
    }

    return NextResponse.json({
      commits: filtered,
      total: filtered.length,
      wasTruncated: allCommits.length >= MAX_COMMITS,
      stats,
      message: null,
    })

  } catch (error: unknown) {
    console.error('Error fetching commits:', error)

    // Edge case: GitHub rate limit
    if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
      return NextResponse.json(
        {
          error: 'GitHub rate limit exceeded',
          message: 'You\'ve hit the GitHub API rate limit. Please wait a few minutes and try again.',
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch commits',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}