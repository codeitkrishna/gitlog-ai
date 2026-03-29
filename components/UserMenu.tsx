// components/UserMenu.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'

export default function UserMenu({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-[#121f23] transition-colors text-[#CAFFD6] max-w-[calc(100vw-7rem)]"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Profile"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
            {user.user_metadata?.user_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-sm font-medium hidden md:block">
          {user.user_metadata?.user_name || user.email?.split('@')[0]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-[#121f23] rounded-lg shadow-lg border border-[#1e3a2a] py-2 z-20">
            <div className="px-4 py-2 border-b border-[#1e3a2a]">
              <p className="text-sm font-medium text-[#CAFFD6]">
                {user.user_metadata?.user_name || 'User'}
              </p>
              <p className="text-xs text-[#7fc28e] truncate">
                {user.email}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-[#CAFFD6] hover:bg-[#0d1317] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Dashboard
              </div>
            </Link>

            <Link
              href="/generator"
              className="block px-4 py-2 text-sm text-[#CAFFD6] hover:bg-[#0d1317] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generator
              </div>
            </Link>

            <Link
              href="/history"
              className="block px-4 py-2 text-sm text-[#CAFFD6] hover:bg-[#0d1317] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </div>
            </Link>

            <div className="border-t border-[#1e3a2a] mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
