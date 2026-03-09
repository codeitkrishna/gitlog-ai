import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-300">
            Welcome, {user.email}!
          </p>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              User ID: {user.id}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              GitHub Username: {user.user_metadata?.user_name || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}