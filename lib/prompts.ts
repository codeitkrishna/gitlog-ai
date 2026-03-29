import type { ChangelogTone } from '@/types/changelog'
import type { CommitData } from '@/types/github'

const TONE_RULES: Record<ChangelogTone, string> = {
  technical: `
    - Use precise technical language
    - Reference specific files, functions, or systems when relevant
    - Include implementation details where meaningful
    - Audience: developers reading code-level documentation`,

  'user-friendly': `
    - Use simple, clear language — no jargon
    - Focus on what changed for the user, not how it was implemented
    - Start descriptions with action verbs (e.g. "You can now...", "Fixed an issue where...")
    - Audience: end users reading product release notes`,

  marketing: `
    - Use exciting, benefit-focused language
    - Emphasise value and impact over technical details
    - Make changes sound compelling and meaningful
    - Audience: customers, stakeholders, or public announcements`,
}

export function buildChangelogPrompt(
  commits: CommitData[],
  tone: ChangelogTone,
  repoName: string,
  currentDate: Date = new Date()
): string {
  // Format commits into a readable list for the AI
  const commitList = commits
    .map(
      (c, i) =>
        `${i + 1}. [${c.shortSha}] ${c.message.split("\n")[0]}
   Author: ${c.author} | Date: ${c.date}
   Files: ${c.filesChanged.slice(0, 5).join(", ")}${c.filesChanged.length > 5 ? ` (+${c.filesChanged.length - 5} more)` : ""}`,
    )
    .join("\n\n");

  return `You are an expert product-focused technical writer analysing Git commits to produce a high-quality, human-like changelog.

Your goal is to write changelog entries that feel natural, useful, and written by a real engineer — NOT generic AI summaries.

CONTEXT:
- Repository: ${repoName}
- Total commits: ${commits.length}
- Output tone: ${tone}
- Today's date: ${formatLocalDate(currentDate)}

TONE INSTRUCTIONS:
${TONE_RULES[tone]}

COMMITS TO ANALYSE:
${commitList}

CATEGORISATION RULES:
- features: New functionality, new pages, new endpoints, new user-facing capabilities
- bugFixes: Fixes for broken behaviour, errors, incorrect flows, failed states
- improvements: Enhancements to existing features, UX polish, performance gains
- breakingChanges: Backward-incompatible changes, removed APIs, required migrations
- chore: Dependency updates, config changes, tooling — include ONLY if user-impacting

STRICT CLASSIFICATION RULES:
- NEVER merge bug fixes into features
- Any commit labeled "fix" must be evaluated as a bugFix first
- Only merge commits if they represent the SAME user-facing change
- If unsure, prefer separating entries over merging

GROUPING RULES:
- Group multiple commits ONLY if they contribute to the same visible outcome
- Do NOT group unrelated commits just because they share files or context
- Skip trivial commits: typo fixes, formatting, whitespace, "wip", "temp", "test"

WRITING RULES (VERY IMPORTANT):
- Avoid generic phrases like:
  "improves performance", "enhances experience", "provides better"
- Be specific about WHAT changed and WHY it matters
- Write like a human engineer, not a marketing AI
- Prefer concrete language over vague statements

GOOD EXAMPLES:
- "You can now log in using your GitHub account"
- "Fixed an issue where login would fail after authentication"
- "Dashboard now shows your repositories"

BAD EXAMPLES:
- "Improves authentication experience"
- "Enhances system performance"
- "Provides better usability"

STYLE RULES:
- Keep titles concise (5–10 words), action-oriented
- Descriptions must feel natural and direct
- Avoid filler words and unnecessary adjectives
- Do NOT exaggerate or oversell changes

OUTPUT INSTRUCTIONS:
1. Categorise every meaningful commit into exactly ONE category
2. For each entry include:
   - title: short, action-oriented (realistic, not marketing-heavy)
   - description: 1–2 sentences, clear and human-like
   - commits: array of SHA strings
3. Return ONLY valid JSON — no markdown, no explanation
4. If a category has no entries, return an empty array

REQUIRED JSON FORMAT:
{
  "features": [
    {
      "title": "Short action-oriented title",
      "description": "Clear, human-sounding explanation of the change.",
      "commits": ["abc1234"]
    }
  ],
  "bugFixes": [],
  "improvements": [],
  "breakingChanges": [],
  "chore": []
}`;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
