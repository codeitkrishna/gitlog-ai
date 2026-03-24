import { createClient } from '@/lib/supabase/server'
import { createGitHubClient } from '@/lib/github'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ owner: string; repo: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const { data: tags } = await octokit.repos.listTags({
      owner,
      repo,
      per_page: 50,
    })

    const formattedTags = tags.map((tag) => ({
      name: tag.name,
      sha: tag.commit.sha,
    }))

    return NextResponse.json({ tags: formattedTags })

  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}