'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'repo read:user',
        },
      })
      if (error) {
        console.error('Error logging in:', error.message)
        alert('Failed to login. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d1317] bg-[url('/images/heroBg.svg')] bg-cover bg-no-repeat"
    >
      {/* Top green radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(35,134,54,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4 flex flex-col items-center">

        {/* Card */}
        <div className="w-full bg-[#121f23] rounded-2xl p-12 flex flex-col items-center gap-8">

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#CAFFD6] mb-2">
              Welcome back
            </h1>
            <p className="text-base text-[#7fc28e] text-center">
              Generate beautiful changelogs in seconds
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#1e3a2a]" />

          {/* GitHub Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-[#CAFFD6] font-semibold px-6 py-4 rounded-lg transition-colors text-base"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </>
            )}
          </button>

          {/* Terms */}
          <p className="mt-6 text-sm text-[#7fc28e] text-center">
            By signing in, you agree to our{' '}
            <span className="text-[#22c55e] cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#22c55e] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-[#7fc28e] text-center">
          AI-powered changelog generation from your Git history
        </p>
      </div>
    </div>
  )
}