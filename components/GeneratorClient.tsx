'use client'

import { useState } from 'react'
import DateRangeSelector from '@/components/DateRangeSelector'
import TagSelector from '@/components/TagSelector'
import CommitList from '@/components/CommitList'
import type { CommitData } from '@/types/github'

interface GeneratorClientProps {
  owner: string
  repo: string
}

type RangeMode = 'date' | 'tag'
type Tone = 'technical' | 'user-friendly' | 'marketing'
type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export default function GeneratorClient({ owner, repo }: GeneratorClientProps) {
  // Range state
  const [rangeMode, setRangeMode] = useState<RangeMode>('date')
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [fromTag, setFromTag] = useState<string | null>(null)
  const [toTag, setToTag] = useState<string | null>(null)

  // Tone state
  const [tone, setTone] = useState<Tone>('technical')

  // Commits state
  const [commits, setCommits] = useState<CommitData[]>([])
  const [wasTruncated, setWasTruncated] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Validation — is the form ready to submit?
  const canFetch =
    rangeMode === 'date'
      ? dateRange.from !== null && dateRange.to !== null
      : fromTag !== null && toTag !== null

  const handleFetch = async () => {
    if (!canFetch) return

    try {
      setFetchStatus('loading')
      setFetchError(null)
      setCommits([])

      const body =
        rangeMode === 'date'
          ? {
              since: dateRange.from!.toISOString(),
              until: dateRange.to!.toISOString(),
            }
          : {
              fromTag,
              toTag,
            }

      const response = await fetch(`/api/repos/${owner}/${repo}/commits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch commits')
      }

      setCommits(data.commits)
      setWasTruncated(data.wasTruncated)
      setFetchStatus('success')

    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Something went wrong')
      setFetchStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">

              {/* Config Header */}
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-4 h-4 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h2 className="text-base font-semibold text-white">Configuration</h2>
              </div>

              {/* Repository Info */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#8b949e] mb-2 uppercase tracking-wide">
                  Repository
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg">
                  <svg className="w-4 h-4 text-[#8b949e] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-sm text-[#c9d1d9]">{owner}/{repo}</span>
                </div>
              </div>

              {/* Range Mode Toggle */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#8b949e] mb-2 uppercase tracking-wide">
                  Commit Range
                </label>
                <div className="flex rounded-lg border border-[#30363d] overflow-hidden">
                  <button
                    onClick={() => setRangeMode('date')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      rangeMode === 'date'
                        ? 'bg-[#238636] text-white'
                        : 'bg-[#0d1117] text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                  >
                    Date Range
                  </button>
                  <button
                    onClick={() => setRangeMode('tag')}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      rangeMode === 'tag'
                        ? 'bg-[#238636] text-white'
                        : 'bg-[#0d1117] text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                  >
                    Tag Range
                  </button>
                </div>
              </div>

              {/* Date Range or Tag Selector */}
              {rangeMode === 'date' ? (
                <DateRangeSelector
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
              ) : (
                <div className="mb-5">
                  <TagSelector
                    owner={owner}
                    repo={repo}
                    fromTag={fromTag}
                    toTag={toTag}
                    setFromTag={setFromTag}
                    setToTag={setToTag}
                  />
                </div>
              )}

              {/* Tone Selector */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#8b949e] mb-3 uppercase tracking-wide">
                  Output Tone
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'technical', label: 'Technical', desc: 'Detailed logs for developers' },
                    { value: 'user-friendly', label: 'User-Friendly', desc: 'Simple language for end users' },
                    { value: 'marketing', label: 'Marketing', desc: 'Exciting updates for public announcements' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border-l-2 ${
                        tone === option.value
                          ? 'bg-[#238636]/10 border-l-[#3fb950] border border-[#238636]/40'
                          : 'bg-[#0d1117] border-l-transparent border border-[#30363d] hover:border-[#8b949e]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        tone === option.value ? 'border-[#3fb950]' : 'border-[#8b949e]'
                      }`}>
                        {tone === option.value && (
                          <div className="w-2 h-2 rounded-full bg-[#3fb950]" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="tone"
                        value={option.value}
                        checked={tone === option.value}
                        onChange={(e) => setTone(e.target.value as Tone)}
                        className="sr-only"
                      />
                      <div>
                        <div className={`text-sm font-medium ${tone === option.value ? 'text-white' : 'text-[#c9d1d9]'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-[#8b949e]">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {fetchStatus === 'error' && fetchError && (
                <div className="mb-4 px-3 py-2 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg">
                  <p className="text-xs text-[#f85149]">{fetchError}</p>
                </div>
              )}

              {/* Fetch Button */}
              <button
                onClick={handleFetch}
                disabled={!canFetch || fetchStatus === 'loading'}
                className={`w-full px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  !canFetch || fetchStatus === 'loading'
                    ? 'bg-[#238636]/40 cursor-not-allowed'
                    : 'bg-[#238636] hover:bg-[#2ea043]'
                }`}
              >
                {fetchStatus === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Fetching Commits...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {fetchStatus === 'success' ? 'Refetch Commits' : 'Fetch Commits'}
                  </>
                )}
              </button>

              {/* Success hint */}
              {fetchStatus === 'success' && commits.length > 0 && (
                <p className="text-xs text-[#8b949e] text-center mt-2">
                  {commits.length} commits loaded — now click Generate Changelog
                </p>
              )}
            </div>

            {/* Commits Card */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d]">
                <svg className="w-4 h-4 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-white">
                  {fetchStatus === 'success' && commits.length > 0
                    ? `${commits.length} Commits Found`
                    : 'Recent Commits'}
                </span>
              </div>

              {fetchStatus === 'loading' && (
                <div className="px-4 py-6 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-[#8b949e]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-[#8b949e]">Fetching commits...</span>
                </div>
              )}

              {fetchStatus === 'idle' && (
                <p className="text-xs text-[#8b949e] px-4 py-3">
                  Select a range and click Fetch Commits
                </p>
              )}

              {fetchStatus === 'error' && (
                <p className="text-xs text-[#f85149] px-4 py-3">
                  Failed to load commits. Try again.
                </p>
              )}

              {fetchStatus === 'success' && (
                <CommitList commits={commits} wasTruncated={wasTruncated} />
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg min-h-150 flex flex-col">

              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-white">Generated Changelog</span>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] border border-[#30363d] rounded-md opacity-40 cursor-not-allowed">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button disabled className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] border border-[#30363d] rounded-md opacity-40 cursor-not-allowed">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#21262d] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    No Changelog Generated Yet
                  </h3>
                  <p className="text-sm text-[#8b949e] max-w-xs mx-auto">
                    {fetchStatus === 'success' && commits.length > 0
                      ? 'Commits loaded! Click "Generate Changelog" to continue'
                      : 'Fetch commits first, then generate your changelog'}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
// ```

// ---

// **What's now wired up:**
// ```
// User selects date range or tags
//         ↓
// canFetch becomes true → button enables
//         ↓
// User clicks "Fetch Commits"
//         ↓
// handleFetch() runs
//   → POST /api/repos/{owner}/{repo}/commits
//   → fetchStatus = 'loading' → spinner shows
//         ↓
// Response comes back
//   → success → commits populate the list below config
//   → error   → red error message shows above button
//         ↓
// Right panel hint updates:
//   "Commits loaded! Click Generate Changelog to continue"