import { generateWithAI } from '@/lib/ai'
import { buildChangelogPrompt } from '@/lib/prompts'
import type { CommitData } from '@/types/github'

const testCommits: CommitData[] = [
  {
    sha: 'abc1234abc1234',
    shortSha: 'abc1234',
    message: 'feat: add GitHub OAuth login with Supabase',
    author: 'Krishna',
    date: '2026-03-20T10:00:00Z',
    filesChanged: ['app/auth/callback/route.ts', 'lib/supabase/client.ts'],
    additions: 85,
    deletions: 12,
  },
  {
    sha: 'def5678def5678',
    shortSha: 'def5678',
    message: 'fix: token not stored after OAuth callback',
    author: 'Krishna',
    date: '2026-03-21T11:00:00Z',
    filesChanged: ['app/auth/callback/route.ts'],
    additions: 20,
    deletions: 3,
  },
  {
    sha: 'ghi9012ghi9012',
    shortSha: 'ghi9012',
    message: 'feat: dashboard shows list of GitHub repos',
    author: 'Krishna',
    date: '2026-03-22T09:00:00Z',
    filesChanged: ['app/dashboard/page.tsx', 'components/RepoCard.tsx', 'lib/github.ts'],
    additions: 210,
    deletions: 5,
  },
  {
    sha: 'jkl3456jkl3456',
    shortSha: 'jkl3456',
    message: 'chore: bump next from 14.1.0 to 14.2.0',
    author: 'dependabot',
    date: '2026-03-22T14:00:00Z',
    filesChanged: ['package.json', 'package-lock.json'],
    additions: 4,
    deletions: 4,
  },
  {
    sha: 'mno7890mno7890',
    shortSha: 'mno7890',
    message: 'fix typo in readme',
    author: 'Krishna',
    date: '2026-03-23T08:00:00Z',
    filesChanged: ['README.md'],
    additions: 1,
    deletions: 1,
  },
]

async function test() {
  console.log('Building prompt...')
  const prompt = buildChangelogPrompt(testCommits, 'user-friendly', 'codeitkrishna/gitlog-ai')
  console.log('\n--- PROMPT ---\n', prompt)

  console.log('\nSending to AI...')
  const response = await generateWithAI(prompt)
  console.log('\n--- RAW RESPONSE ---\n', response)

  try {
    const parsed = JSON.parse(response)
    console.log('\n--- PARSED JSON ---\n', JSON.stringify(parsed, null, 2))
    console.log('\n✅ Valid JSON returned')
  } catch {
    console.log('\n❌ Invalid JSON — needs prompt adjustment')
  }
}

test().catch(console.error)