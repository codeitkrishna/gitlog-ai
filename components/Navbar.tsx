import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Button from './ui/Button'
import UserMenu from './UserMenu'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <Link href="/">
          <h1 className="font-bold text-lg cursor-pointer hover:text-blue-600 transition-colors">
            GitLog AI
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <a className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            Docs
          </a>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login">
              <Button variant="primary">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}