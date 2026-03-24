'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { CommitData } from '@/types/github'

interface CommitListProps {
  commits: CommitData[]
  wasTruncated?: boolean
}

export default function CommitList({ commits, wasTruncated }: CommitListProps) {
  const [expandedShas, setExpandedShas] = useState<Set<string>>(new Set())

  const toggleExpand = (sha: string) => {
    setExpandedShas((prev) => {
      const next = new Set(prev)
      next.has(sha) ? next.delete(sha) : next.add(sha)
      return next
    })
  }

  if (commits.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-[#21262d] flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-[#8b949e]">No commits found in this range</p>
        <p className="text-xs text-[#8b949e] mt-1">Try a different date range</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium text-white">
            {commits.length} Commits Found
          </span>
        </div>
        {wasTruncated && (
          <span className="text-xs text-[#f0883e] bg-[#f0883e]/10 border border-[#f0883e]/30 px-2 py-0.5 rounded-full">
            Showing first 500
          </span>
        )}
      </div>

      {/* Truncation Warning */}
      {wasTruncated && (
        <div className="mx-4 mt-3 px-3 py-2 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
          <p className="text-xs text-[#f0883e]">
            This range has 500+ commits. Showing the first 500 only. Try a shorter date range for complete results.
          </p>
        </div>
      )}

      {/* Commit List */}
      <div className="divide-y divide-[#30363d]">
        {commits.map((commit) => {
          const isExpanded = expandedShas.has(commit.sha)
          const firstLine = commit.message.split('\n')[0]
          const hasBody = commit.message.split('\n').filter(l => l.trim()).length > 1
          const hasFiles = commit.filesChanged.length > 0

          return (
            <div key={commit.sha} className="px-4 py-3 hover:bg-[#161b22] transition-colors">

              {/* Main Row */}
              <div className="flex items-start gap-3">

                {/* Commit dot */}
                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3fb950] shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">

                  {/* Message */}
                  <p className="text-sm text-[#c9d1d9] leading-snug break-words">
                    {firstLine}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">

                    {/* SHA */}
                    <span className="font-mono text-xs text-[#58a6ff] bg-[#58a6ff]/10 px-1.5 py-0.5 rounded">
                      {commit.shortSha}
                    </span>

                    {/* Author */}
                    <span className="text-xs text-[#8b949e] flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {commit.author}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-[#8b949e] flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                    </span>

                    {/* Stats */}
                    {(commit.additions > 0 || commit.deletions > 0) && (
                      <span className="text-xs flex items-center gap-1">
                        <span className="text-[#3fb950]">+{commit.additions}</span>
                        <span className="text-[#f85149]">-{commit.deletions}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand toggle — only if there are files or body */}
                {(hasFiles || hasBody) && (
                  <button
                    onClick={() => toggleExpand(commit.sha)}
                    className="mt-0.5 p-1 rounded text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] transition-colors shrink-0"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="mt-3 ml-5 space-y-3">

                  {/* Full commit message body */}
                  {hasBody && (
                    <div className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg">
                      <p className="text-xs text-[#8b949e] mb-1 font-medium uppercase tracking-wide">
                        Full message
                      </p>
                      <pre className="text-xs text-[#c9d1d9] whitespace-pre-wrap font-mono leading-relaxed">
                        {commit.message}
                      </pre>
                    </div>
                  )}

                  {/* Files changed */}
                  {hasFiles && (
                    <div className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg">
                      <p className="text-xs text-[#8b949e] mb-2 font-medium uppercase tracking-wide">
                        Files changed ({commit.filesChanged.length})
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {commit.filesChanged.map((file) => (
                          <div key={file} className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-[#8b949e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs font-mono text-[#c9d1d9] truncate">
                              {file}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}