import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const providerToken = data.session?.provider_token

    if (providerToken && data.user) {
      const { error: updateError } = await supabase.from("user_tokens").upsert(
        {
          user_id: data.user.id,
          provider: "github",
          access_token: providerToken,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,provider",
        },
      );

      if (updateError) {
        console.error('Error storing GitHub token:', updateError.message)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}