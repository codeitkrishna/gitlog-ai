'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { generateChangelogMarkdown } from '@/lib/markdown'
import type {
  ChangelogCategoryKey,
  ChangelogResult,
  ChangelogTone,
} from '@/types/changelog'
import type { CommitData } from '@/types/github'

interface ChangelogPreviewProps {
  changelog: ChangelogResult
  repoName: string
  tone: ChangelogTone
  commits: CommitData[]
  generatedAt: string | null
}

const CATEGORY_CONFIG: Array<{
  key: ChangelogCategoryKey
  label: string
  icon: string
}> = [
  { key: 'features', label: 'Features', icon: 'F' },
  { key: 'bugFixes', label: 'Bug Fixes', icon: 'B' },
  { key: 'improvements', label: 'Improvements', icon: 'I' },
  { key: 'breakingChanges', label: 'Breaking Changes', icon: '!' },
  { key: 'chore', label: 'Chore', icon: 'C' },
]

export default function ChangelogPreview({
  changelog,
  repoName,
  tone,
  commits,
  generatedAt,
}: ChangelogPreviewProps) {
  // edited holds user's changes, original holds the AI version for reset
  const [edited, setEdited] = useState<ChangelogResult>(() => cloneChangelog(changelog))
  const [original] = useState<ChangelogResult>(() => cloneChangelog(changelog))
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)

  const updateEntry = (
    category: ChangelogCategoryKey,
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setEdited((prev) => {
      const entries = [...prev[category]]
      entries[index] = { ...entries[index], [field]: value }
      return { ...prev, [category]: entries }
    })
  }

  const resetEntry = (category: ChangelogCategoryKey, index: number) => {
    setEdited((prev) => {
      const entries = [...prev[category]]
      entries[index] = { ...original[category][index] }
      return { ...prev, [category]: entries }
    })
    setEditingKey(null)
  }

  const isEntryEdited = (category: ChangelogCategoryKey, index: number): boolean => {
    const orig = original[category][index]
    const curr = edited[category][index]
    if (!orig || !curr) return false
    return orig.title !== curr.title || orig.description !== curr.description
  }

  const populatedCategories = CATEGORY_CONFIG.filter(
    (cat) => edited[cat.key].length > 0
  )

  const handleCopyMarkdown = async () => {
    setIsCopying(true)

    try {
      const markdown = generateChangelogMarkdown(edited, {
        repoName,
        tone,
        generatedAt,
        commitCount: commits.length,
        contributors: commits.map((commit) => commit.author),
        dateRange: getCommitDateRange(commits),
      })

      await copyTextToClipboard(markdown)
      toast.success('Markdown copied to clipboard')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not copy Markdown to clipboard'
      )
    } finally {
      setIsCopying(false)
    }
  }

  if (populatedCategories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#0d1317] border border-[#1e3a2a] flex items-center justify-center mx-auto mb-4 text-lg font-semibold text-[#7fc28e]">
            0
          </div>
          <h3 className="text-base font-semibold text-[#CAFFD6] mb-1">
            No meaningful changes found
          </h3>
          <p className="text-sm text-[#7fc28e] max-w-sm mx-auto">
            The AI skipped every commit as trivial. Try a broader range or loosen your filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#7fc28e] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Click any title or description to edit inline
        </p>

        <button
          onClick={handleCopyMarkdown}
          disabled={isCopying}
          className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:self-auto ${
            isCopying
              ? 'cursor-wait border border-[#1e3a2a] text-[#7fc28e] opacity-70'
              : 'border border-[#238636]/40 bg-[#238636]/15 text-[#CAFFD6] hover:bg-[#238636]/25'
          }`}
        >
          {isCopying ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
          {isCopying ? 'Copying...' : 'Copy Markdown'}
        </button>
      </div>

      {populatedCategories.map((category) => {
        const entries = edited[category.key]

        return (
          <section
            key={category.key}
            className="rounded-xl border border-[#1e3a2a] bg-[#0d1317]/70 overflow-hidden"
          >
            {/* Category header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3a2a] bg-[#10191d]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#238636]/20 border border-[#238636]/30 flex items-center justify-center text-xs font-semibold text-[#22c55e]">
                  {category.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#CAFFD6]">{category.label}</h3>
              </div>
              <span className="text-xs text-[#22c55e] bg-[#238636]/10 border border-[#238636]/30 px-2 py-0.5 rounded-full">
                {entries.length}
              </span>
            </div>

            {/* Entries */}
            <div className="divide-y divide-[#1e3a2a]">
              {entries.map((entry, index) => {
                const entryKey = `${category.key}-${index}`
                const isEditing = editingKey === entryKey
                const hasEdits = isEntryEdited(category.key, index)

                return (
                  <article key={entryKey} className="p-4 group">

                    {/* Entry header row */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      {/* Title */}
                      {isEditing ? (
                        <input
                          autoFocus
                          value={entry.title}
                          onChange={(e) => updateEntry(category.key, index, 'title', e.target.value)}
                          className="flex-1 text-sm font-semibold text-[#CAFFD6] bg-[#121f23] border border-[#238636]/50 rounded-md px-2 py-1 focus:outline-none focus:border-[#22c55e] transition-colors"
                        />
                      ) : (
                        <h4
                          onClick={() => setEditingKey(entryKey)}
                          className="flex-1 text-sm font-semibold text-[#CAFFD6] cursor-text hover:text-white transition-colors"
                          title="Click to edit"
                        >
                          {entry.title}
                        </h4>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <button
                            onClick={() => setEditingKey(null)}
                            className="text-xs text-[#22c55e] bg-[#238636]/20 border border-[#238636]/30 px-2 py-1 rounded-md hover:bg-[#238636]/30 transition-colors"
                          >
                            Done
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingKey(entryKey)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-[#7fc28e] px-2 py-1 rounded-md hover:text-[#CAFFD6] transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {hasEdits && (
                          <button
                            onClick={() => resetEntry(category.key, index)}
                            className="text-xs text-[#7fc28e] px-2 py-1 rounded-md hover:text-red-400 transition-colors"
                            title="Reset to AI version"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {isEditing ? (
                      <textarea
                        value={entry.description}
                        onChange={(e) => updateEntry(category.key, index, 'description', e.target.value)}
                        rows={3}
                        className="w-full text-sm text-[#7fc28e] bg-[#121f23] border border-[#238636]/50 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#22c55e] transition-colors resize-none leading-relaxed"
                      />
                    ) : (
                      <p
                        onClick={() => setEditingKey(entryKey)}
                        className="text-sm text-[#7fc28e] leading-6 cursor-text hover:text-[#CAFFD6] transition-colors"
                        title="Click to edit"
                      >
                        {entry.description}
                      </p>
                    )}

                    {/* Edited indicator */}
                    {hasEdits && !isEditing && (
                      <span className="inline-block mt-2 text-xs text-[#f0883e] bg-[#f0883e]/10 border border-[#f0883e]/20 px-2 py-0.5 rounded-full">
                        edited
                      </span>
                    )}

                    {/* Commit SHAs */}
                    {entry.commits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entry.commits.map((commit) => (
                          <span
                            key={commit}
                            className="font-mono text-xs text-[#22c55e] bg-[#22c55e]/10 border border-[#238636]/20 px-2 py-1 rounded-md"
                          >
                            {commit}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  textArea.style.top = '0'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const copied = document.execCommand('copy')

    if (!copied) {
      throw new Error('Clipboard copy is not available in this browser')
    }
  } finally {
    document.body.removeChild(textArea)
  }
}

function getCommitDateRange(commits: CommitData[]) {
  if (commits.length === 0) return undefined

  const timestamps = commits
    .map((commit) => new Date(commit.date).getTime())
    .filter((timestamp) => !Number.isNaN(timestamp))

  if (timestamps.length === 0) return undefined

  return {
    from: new Date(Math.min(...timestamps)),
    to: new Date(Math.max(...timestamps)),
  }
}

function cloneChangelog(changelog: ChangelogResult): ChangelogResult {
  return {
    features: changelog.features.map((entry) => ({ ...entry, commits: [...entry.commits] })),
    bugFixes: changelog.bugFixes.map((entry) => ({ ...entry, commits: [...entry.commits] })),
    improvements: changelog.improvements.map((entry) => ({ ...entry, commits: [...entry.commits] })),
    breakingChanges: changelog.breakingChanges.map((entry) => ({
      ...entry,
      commits: [...entry.commits],
    })),
    chore: changelog.chore.map((entry) => ({ ...entry, commits: [...entry.commits] })),
  }
}
