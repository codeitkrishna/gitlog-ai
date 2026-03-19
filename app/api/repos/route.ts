import { createClient } from '@/lib/supabase/server'
import { getUserRepositories } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get GitHub token from our database
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('provider', 'github')
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'GitHub token not found. Please log out and log in again.' },
        { status: 400 }
      )
    }

    const repos = await getUserRepositories(tokenData.access_token)

    return NextResponse.json({
      repos,
      total: repos.length,
    })
  } catch (error) {
    console.error('Error in /api/repos:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch repositories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}