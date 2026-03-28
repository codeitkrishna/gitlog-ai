> Transform your Git commit history into clean, professional changelogs — in seconds.

GitLog AI connects to your GitHub repositories, fetches commits across a date range or between version tags, and uses Claude AI to categorize and rewrite them into readable, audience-appropriate release notes. No more copy-pasting raw git logs or spending an hour writing release notes before a launch.

---

## Features

- **GitHub OAuth Login** — Sign in with your GitHub account, no separate credentials needed
- **Repository Browser** — Search, sort, and select from all your public and private repos
- **Flexible Commit Range** — Pick commits by date range (last 7/30/90 days, this month, or custom) or between version tags
- **Three Output Tones** — Technical (for engineers), User-Friendly (for end users), Marketing (for announcements)
- **AI Categorization** — Claude automatically groups commits into Features, Bug Fixes, Improvements, Breaking Changes, and Chores
- **Export Options** — Copy as Markdown or download as a `.md` file, ready to paste into GitHub Releases or your docs

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (GitHub OAuth) |
| Database | Supabase (PostgreSQL) |
| GitHub API | Octokit |
| AI | Anthropic Claude API |
| Deployment | Vercel |

---

## Architecture

```
User
 │
 ├── Logs in via GitHub OAuth
 │     └── Supabase exchanges OAuth code for session + GitHub token
 │           └── GitHub token stored in Supabase DB (user_tokens table)
 │
 ├── Browses repositories
 │     └── /api/repos fetches GitHub token from DB → calls GitHub API via Octokit
 │
 ├── Selects repo + date range + tone
 │     └── /api/commits fetches commits from GitHub API
 │
 └── Clicks Generate
       └── /api/generate sends commits to Claude API
             └── Claude returns categorized, rewritten changelog as JSON
                   └── Rendered in UI → export as Markdown
```

**Auth flow in detail:**

The app uses two types of tokens that serve completely different purposes:

- **Session token** (managed by Supabase) — stored in a cookie, proves the user is logged into GitLog AI, read on every request by middleware to protect routes
- **GitHub provider token** — issued by GitHub during OAuth, stored in the database, used only when calling the GitHub API on the user's behalf

Middleware runs before every page load, silently refreshes the session if expired, and redirects unauthenticated users away from protected routes.

---

## Project Structure

```
gitlog-ai/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── api/
│   │   ├── repos/             # Fetch user's GitHub repos
│   │   ├── commits/           # Fetch commits for a repo
│   │   └── generate/          # Send commits to Claude AI
│   ├── auth/callback/         # OAuth callback handler
│   ├── dashboard/             # Repository browser
│   └── generate/[owner]/[repo]/ # Changelog generator
├── components/
│   ├── GeneratorClient.tsx    # Main generator UI
│   ├── DateRangeSelector.tsx  # Date/tag range picker
│   ├── DashboardClient.tsx    # Repo grid with search/sort
│   ├── RepoCard.tsx           # Individual repo card
│   └── Navbar.tsx / UserMenu.tsx
├── lib/
│   ├── github.ts              # Octokit wrapper
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   └── server.ts          # Server Supabase client
└── types/
    └── github.ts              # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A GitHub account
- A Supabase account (free tier works)
- An Anthropic API key

### 1. Clone the repository

```bash
git clone https://github.com/codeitkrishna/gitlog-ai.git
cd gitlog-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

- Create a new project at [supabase.com](https://supabase.com/)
- Go to **Authentication → Providers** and enable GitHub
- Create a GitHub OAuth App at **GitHub → Settings → Developer Settings → OAuth Apps**
    - Homepage URL: `http://localhost:3000`
    - Callback URL: your Supabase callback URL (found in the GitHub provider settings)
- Paste the GitHub Client ID and Secret into Supabase

Run this SQL in your Supabase SQL editor to create the required table:

```sql
-- Table to store GitHub tokens
CREATE TABLE user_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  provider text NOT NULL,
  access_token text NOT NULL,
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Table to store generated changelogs
CREATE TABLE changelogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  repo_name text NOT NULL,
  repo_owner text NOT NULL,
  version_from text,
  version_to text,
  tone text,
  content jsonb,
  markdown text,
  created_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;

-- user_tokens policies
CREATE POLICY "Users can manage own tokens"
ON user_tokens FOR ALL
USING (auth.uid() = user_id);

-- changelogs policies
CREATE POLICY "Users can view own changelogs"
ON changelogs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own changelogs"
ON changelogs FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 4. Configure environment variables

Create a `.env.local` file at the root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SUPABASE_SERVICE_ROLE_KEY= # Used for secure server-side operations (never expose)

ANTHROPIC_API_KEY=sk-ant-your-key

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000/) and log in with GitHub.

---

## License

MIT