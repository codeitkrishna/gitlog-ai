'use client'

import { useState, useEffect } from 'react'
import type { Tag } from '@/types/github'

interface TagSelectorProps {
  owner: string
  repo: string
  fromTag: string | null
  toTag: string | null
  setFromTag: (tag: string | null) => void
  setToTag: (tag: string | null) => void
}

export default function TagSelector({
  owner,
  repo,
  fromTag,
  toTag,
  setFromTag,
  setToTag,
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTags()
  }, [owner, repo])

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/repos/${owner}/${repo}/tags`)
      if (!response.ok) throw new Error('Failed to fetch tags')
      const data = await response.json()
      setTags(data.tags)
    } catch (err) {
      setError('Could not load tags')
    } finally {
      setLoading(false)
    }
  }

  // No tags found
  if (!loading && tags.length === 0) {
    return (
      <div className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#8b949e]">
        No tags found in this repository
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* From Tag */}
      <div>
        <label className="block text-xs text-[#8b949e] mb-1.5">From tag</label>
        <select
          value={fromTag || ''}
          onChange={(e) => setFromTag(e.target.value || null)}
          disabled={loading}
          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] disabled:opacity-50 cursor-pointer"
        >
          <option value="">Select start tag...</option>
          {tags.map((tag) => (
            <option key={tag.sha} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* To Tag */}
      <div>
        <label className="block text-xs text-[#8b949e] mb-1.5">To tag</label>
        <select
          value={toTag || ''}
          onChange={(e) => setToTag(e.target.value || null)}
          disabled={loading}
          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] disabled:opacity-50 cursor-pointer"
        >
          <option value="">Select end tag...</option>
          {tags.map((tag) => (
            <option key={tag.sha} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected range display */}
      <div className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm">
        <div className="flex items-center gap-2 text-[#c9d1d9]">
          <svg className="w-4 h-4 text-[#8b949e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {fromTag && toTag ? (
            <span>{fromTag} → {toTag}</span>
          ) : (
            <span className="text-[#8b949e]">No tag range selected</span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#f85149]">{error}</p>
      )}
    </div>
  )
}