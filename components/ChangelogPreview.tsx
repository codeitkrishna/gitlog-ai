'use client'

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
  const populatedCategories = CATEGORY_CONFIG.filter(
    (category) => changelog[category.key].length > 0
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
      {populatedCategories.map((category) => {
        const entries = changelog[category.key]

        return (
          <section
            key={category.key}
            className="rounded-xl border border-[#1e3a2a] bg-[#0d1317]/70 overflow-hidden"
          >
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

            <div className="divide-y divide-[#1e3a2a]">
              {entries.map((entry) => (
                <article key={`${category.key}-${entry.title}`} className="p-4">
                  <h4 className="text-sm font-semibold text-[#CAFFD6] mb-1.5">{entry.title}</h4>
                  <p className="text-sm text-[#7fc28e] leading-6">{entry.description}</p>
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
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
