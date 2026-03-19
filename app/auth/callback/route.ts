import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('=== CALLBACK START ===')
  console.log('Full URL:', request.url)
  console.log('Code from searchParams:', code)
  console.log('All search params:', Object.fromEntries(requestUrl.searchParams))

  if (code) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Exchange error:', error)
    console.log('Has session:', !!data.session)
    console.log('Provider token:', data.session?.provider_token)
    console.log('User ID:', data.user?.id)

    if (error) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const providerToken = data.session?.provider_token

    if (providerToken && data.user) {
      console.log('Attempting to store token for user:', data.user.id)
      
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
        console.error('Error storing token:', updateError)
      } else {
        console.log('Token stored successfully!')
      }
    } else {
      console.log('No provider token available!')
      console.log('Session data:', JSON.stringify(data.session, null, 2))
    }
  } else {
    console.log('NO CODE IN URL!')
  }

  console.log('=== CALLBACK END ===')
  
  return NextResponse.redirect(`${origin}/dashboard`)
}