'use client'

import { useState } from 'react'
import type { ChangelogCategoryKey, ChangelogResult } from '@/types/changelog'

interface ChangelogPreviewProps {
  changelog: ChangelogResult
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

export default function ChangelogPreview({ changelog }: ChangelogPreviewProps) {
  // edited holds user's changes, original holds the AI version for reset
  const [edited, setEdited] = useState<ChangelogResult>(() => cloneChangelog(changelog))
  const [original] = useState<ChangelogResult>(() => cloneChangelog(changelog))
  const [editingKey, setEditingKey] = useState<string | null>(null)

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
      {/* Edit hint */}
      <p className="text-xs text-[#7fc28e] flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Click any title or description to edit inline
      </p>

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
