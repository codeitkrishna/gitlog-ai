// app/api/repos/[owner]/[repo]/commits/route.ts

import { createClient } from '@/lib/supabase/server'
import { createGitHubClient } from '@/lib/github'
import { NextResponse } from 'next/server'
import type { CommitData } from '@/types/github'

interface RouteParams {
  params: Promise<{ owner: string; repo: string }>
}

interface CommitRequestBody {
  since?: string      // ISO date string for date range mode
  until?: string      // ISO date string for date range mode
  fromTag?: string    // tag name for tag range mode
  toTag?: string      // tag name for tag range mode
}

const MAX_COMMITS = 500

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Step 1: Auth check
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: Get GitHub token from DB
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

    let since: string | undefined
    let until: string | undefined

    // Step 3: Resolve date range
    // Mode A: direct date range
    if (body.since && body.until) {
      since = body.since
      until = body.until
    }
    // Mode B: tag range — convert tags to dates
    // else if (body.fromTag && body.toTag) {
    //   const [fromTagData, toTagData] = await Promise.all([
    //     octokit.git.getRef({ owner, repo, ref: `tags/${body.fromTag}` }),
    //     octokit.git.getRef({ owner, repo, ref: `tags/${body.toTag}` }),
    //   ])

    //   // Get the commit date for each tag's SHA
    //   const [fromCommit, toCommit] = await Promise.all([
    //     octokit.repos.getCommit({ owner, repo, ref: fromTagData.data.object.sha }),
    //     octokit.repos.getCommit({ owner, repo, ref: toTagData.data.object.sha }),
    //   ])

    //   since = fromCommit.data.commit.author?.date
    //   until = toCommit.data.commit.author?.date
    else if (body.fromTag && body.toTag) {
  const resolveTagToCommitDate = async (tagName: string) => {
    const ref = await octokit.git.getRef({ owner, repo, ref: `tags/${tagName}` })
    const sha = ref.data.object.sha
    const type = ref.data.object.type

    // If annotated tag, dereference to get the actual commit SHA
    if (type === 'tag') {
      const tagObject = await octokit.git.getTag({ owner, repo, tag_sha: sha })
      const commitSha = tagObject.data.object.sha
      const commit = await octokit.repos.getCommit({ owner, repo, ref: commitSha })
      return commit.data.commit.author?.date
    }

    // Lightweight tag — SHA is already the commit SHA
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
        { error: 'Provide either since+until dates or fromTag+toTag' },
        { status: 400 }
      )
    }

    // Step 4: Fetch commits with pagination (Task 5.6)
    const allCommits: CommitData[] = []
    let page = 1
    let hasMore = true

    while (hasMore && allCommits.length < MAX_COMMITS) {
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        since,
        until,
        per_page: 100,   // max GitHub allows per page
        page,
      })

      if (commits.length === 0) {
        // No more commits
        hasMore = false
        break
      }

      // Step 5: For each commit, fetch files changed
      // We do this in parallel but limit to avoid rate limits
      const commitsWithFiles = await Promise.all(
        commits.map(async (commit) => {
          try {
            const { data: detail } = await octokit.repos.getCommit({
              owner,
              repo,
              ref: commit.sha,
            })

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
            // If we can't get file details, return commit without them
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

      // If GitHub returned less than 100, we've reached the last page
      if (commits.length < 100) {
        hasMore = false
      } else {
        page++
      }
    }

    const wasTruncated = allCommits.length >= MAX_COMMITS

    return NextResponse.json({
      commits: allCommits,
      total: allCommits.length,
      wasTruncated,     // tells frontend if we hit the 500 limit
      message: wasTruncated
        ? `Showing first ${MAX_COMMITS} commits. Try a shorter date range for complete results.`
        : null,
    })

  } catch (error) {
    console.error('Error fetching commits:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch commits',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}