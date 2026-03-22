'use client'
import { useState } from 'react'
import DateRangeSelector from '@/components/DateRangeSelector'
interface GeneratorClientProps {
  owner: string
  repo: string
}

export default function GeneratorClient({ owner, repo }: GeneratorClientProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [tone, setTone] = useState<'technical' | 'user-friendly' | 'marketing'>('technical')

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

              {/* Date Range Selector */}
              <DateRangeSelector
                dateRange={dateRange}
                setDateRange={setDateRange}
              />

              {/* Tone Selector — Fix #3: subtle left-border style */}
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
                      {/* Custom radio dot */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        tone === option.value
                          ? 'border-[#3fb950]'
                          : 'border-[#8b949e]'
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
                        onChange={(e) => setTone(e.target.value as typeof tone)}
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

              {/* Fetch Button */}
              <button className="w-full px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch & Generate
              </button>
            </div>

            {/* Recent Commits Card — Fix #4: cleaner layout */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-white">Recent Commits</span>
                </div>
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-xs text-[#8b949e] mt-2">
                Select a date range to view commits
              </p>
            </div>
          </div>

          {/* Right Column - Preview — Fix #5: cleaner empty state */}
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
                {/* Export buttons — disabled for now */}
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
                    Select a date range and click &quot;Fetch & Generate&quot; to create your changelog
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