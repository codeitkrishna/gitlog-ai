import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GeneratorClient from '@/components/GeneratorClient'

interface PageProps {
  params: Promise<{
    owner: string
    repo: string
  }>
}

export default async function GeneratorPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { owner, repo } = await params

  return <GeneratorClient owner={owner} repo={repo} />
}