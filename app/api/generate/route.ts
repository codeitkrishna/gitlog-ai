//app/api/generate/route.ts
import { NextResponse } from 'next/server'
import { generateWithAI } from '@/lib/ai'
import { parseChangelogResponse } from '@/lib/ai-parser'
import { buildChangelogPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import type { GenerateChangelogRequestBody, ChangelogTone } from '@/types/changelog'
import type { CommitData } from '@/types/github'

const VALID_TONES: ChangelogTone[] = ['technical', 'user-friendly', 'marketing']
const MAX_COMMITS = 500

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("changelog_generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if (!countError && count !== null && count >= 10) {
      return NextResponse.json(
        {
          error: "Rate limit reached",
          message:
            "You can generate up to 10 changelogs per hour. Please wait before trying again.",
        },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Partial<GenerateChangelogRequestBody>
    const tone = body.tone

    if (!isValidTone(tone)) {
      return NextResponse.json(
        {
          error: 'Invalid tone',
          message: 'Tone must be one of: technical, user-friendly, or marketing.',
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.commits) || body.commits.length === 0) {
      return NextResponse.json(
        {
          error: 'No commits provided',
          message: 'Fetch commits first, then send them to /api/generate.',
        },
        { status: 400 }
      )
    }

    if (body.commits.length > MAX_COMMITS) {
      return NextResponse.json(
        {
          error: 'Too many commits',
          message: `Please send ${MAX_COMMITS} commits or fewer per generation request.`,
        },
        { status: 400 }
      )
    }

    const repoName = resolveRepoName(body)

    if (!repoName) {
      return NextResponse.json(
        {
          error: 'Missing repository info',
          message: 'Provide repoName or both owner and repo in the request body.',
        },
        { status: 400 }
      )
    }

    const commits = normalizeCommits(body.commits);
    const prompt = buildChangelogPrompt(commits, tone, repoName);
    const rawResponse = await generateWithAI(prompt);
    const changelog = parseChangelogResponse(rawResponse);

    await supabase.from("changelog_generations").insert({
      user_id: user.id,
      repo_name: repoName,
      commit_count: commits.length,
      tone,
    });


    return NextResponse.json({
      changelog,
      metadata: {
        repoName,
        tone,
        totalCommits: commits.length,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error in /api/generate:', error)

    const status = getErrorStatus(error)

    return NextResponse.json(
      {
        error: 'Failed to generate changelog',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status }
    )
  }
}

function isValidTone(value: unknown): value is ChangelogTone {
  return typeof value === 'string' && VALID_TONES.includes(value as ChangelogTone)
}

function resolveRepoName(body: Partial<GenerateChangelogRequestBody>) {
  if (typeof body.repoName === 'string' && body.repoName.trim()) {
    return body.repoName.trim()
  }

  if (typeof body.owner === 'string' && typeof body.repo === 'string') {
    const owner = body.owner.trim()
    const repo = body.repo.trim()

    if (owner && repo) {
      return `${owner}/${repo}`
    }
  }

  return null
}

function normalizeCommits(commits: unknown[]): CommitData[] {
  return commits.map((commit, index) => {
    if (!isCommitData(commit)) {
      throw new Error(`Commit at index ${index} is missing required fields.`)
    }

    return {
      sha: commit.sha,
      shortSha: commit.shortSha,
      message: commit.message,
      author: commit.author,
      date: commit.date,
      filesChanged: commit.filesChanged,
      additions: commit.additions,
      deletions: commit.deletions,
    }
  })
}

function isCommitData(value: unknown): value is CommitData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const commit = value as Record<string, unknown>

  return (
    typeof commit.sha === 'string' &&
    typeof commit.shortSha === 'string' &&
    typeof commit.message === 'string' &&
    typeof commit.author === 'string' &&
    typeof commit.date === 'string' &&
    Array.isArray(commit.filesChanged) &&
    commit.filesChanged.every((file) => typeof file === 'string') &&
    typeof commit.additions === 'number' &&
    typeof commit.deletions === 'number'
  )
}

function getErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 500
  }

  const lowerMessage = error.message.toLowerCase()

  if (lowerMessage.includes('rate limit')) {
    return 429
  }

  if (
    lowerMessage.includes('valid json') ||
    lowerMessage.includes('json content') ||
    lowerMessage.includes('must be an array') ||
    lowerMessage.includes('missing a valid')
  ) {
    return 502
  }

  return 500
}
