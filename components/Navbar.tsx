import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UserMenu from './UserMenu'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#22c55e] bg-[#0D1317]/70 backdrop-blur-md opacity-95">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2 group">
          {/* <div className="w-7 h-7 rounded-md bg-[#238636] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#CAFFD6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div> */}
          <span className="font-bold text-[#15E160] text-2xl tracking-tight group-hover:text-green-400 transition-colors">
            Gitlog-Ai
          </span>
        </Link>

        <div className="flex items-center gap-6">

          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="bg-[#238636] hover:bg-[#2ea043] text-[#CAFFD6] font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-base"
              >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}