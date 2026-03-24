// components/DashboardClient/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Repository } from '@/types/github'
import RepoCard from './RepoCard'
import RepoCardSkeleton from './RepoCardSkeleton'

type SortOption = 'updated' | 'name' | 'stars'

export default function DashboardClient() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [displayCount, setDisplayCount] = useState(12)

  useEffect(() => {
    fetchRepos()
  }, [])

  useEffect(() => {
    filterAndSortRepos()
  }, [searchQuery, sortBy, repos])

  const fetchRepos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/repos')
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      setRepos(data.repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRepos = () => {
    let result = [...repos]

    // Filter by search query
    if (searchQuery.trim() !== '') {
      result = result.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'stars':
          return b.stars - a.stars
        case 'updated':
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      }
    })

    setFilteredRepos(result)
  }

  const loadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  const visibleRepos = filteredRepos.slice(0, displayCount)
  const hasMore = displayCount < filteredRepos.length

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Repositories</h1>
          <p className="text-[#8b949e]">
            Manage and monitor your connected git projects with AI insights.
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search repositories by name, language or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] transition-colors cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="stars">Most Stars</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <RepoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#da3633]/10 mb-4">
              <svg className="w-8 h-8 text-[#da3633]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load repositories</h3>
            <p className="text-[#8b949e] mb-6">{error}</p>
            <button
              onClick={fetchRepos}
              className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRepos.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-[#30363d] rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#238636]/10 mb-4">
              <svg className="w-8 h-8 text-[#3fb950]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-[#8b949e] mb-6">
              {searchQuery
                ? "We couldn't find any repositories matching your search. Try a different term."
                : "We couldn't find any repositories. Connect a new account or check your GitHub permissions."}
            </p>
            <div className="flex gap-4 justify-center">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
              <button className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors">
                Reconnect GitHub
              </button>
            </div>
          </div>
        )}

        {/* Repos Grid */}
        {!loading && !error && filteredRepos.length > 0 && (
          <>
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between text-sm text-[#8b949e]">
              <span>
                Showing {visibleRepos.length} of {filteredRepos.length} repositories
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
              {repos.length !== filteredRepos.length && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#58a6ff] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] rounded-lg transition-colors font-medium"
                >
                  Load More ({filteredRepos.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}