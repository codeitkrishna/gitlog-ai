// components/DateRangeSelector.tsx
'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, startOfMonth } from 'date-fns'
import 'react-day-picker/dist/style.css'

interface DateRangeSelectorProps {
  dateRange: { from: Date | null; to: Date | null }
  setDateRange: (range: { from: Date | null; to: Date | null }) => void
}

export default function DateRangeSelector({ dateRange, setDateRange }: DateRangeSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const setPreset = (label: string, days: number) => {
    if (label === 'This Month') {
      const from = startOfMonth(new Date())
      const to = new Date()
      setDateRange({ from, to })
      setActivePreset('This Month')
      setShowCalendar(false)
      return
    }
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    setDateRange({ from, to })
    setActivePreset(label)
    setShowCalendar(false)
  }

  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'This Month', days: 0 },
    { label: 'Custom', days: -1 },
  ]

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#8b949e] mb-3">
        Date Range
      </label>

      {/* 2x2 Preset Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() =>
              preset.label === 'Custom'
                ? (setShowCalendar(!showCalendar), setActivePreset('Custom'))
                : setPreset(preset.label, preset.days)
            }
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              activePreset === preset.label
                ? 'bg-[#238636]/20 border-[#238636] text-[#3fb950]'
                : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date Range Display — always visible, shows placeholder when empty */}
      <div className="mb-3 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm">
        <div className="flex items-center gap-2 text-[#c9d1d9]">
          <svg className="w-4 h-4 text-[#8b949e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateRange.from && dateRange.to ? (
            <span>{format(dateRange.from, 'MMM dd, yyyy')} — {format(dateRange.to, 'MMM dd, yyyy')}</span>
          ) : (
            <span className="text-[#8b949e]">No date range selected</span>
          )}
        </div>
      </div>

      {/* Custom Calendar */}
      {showCalendar && (
        <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <DayPicker
            mode="range"
            selected={{ from: dateRange.from || undefined, to: dateRange.to || undefined }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ from: range.from, to: range.to })
                setShowCalendar(false)
              }
            }}
            disabled={{ after: new Date() }}
            className="rdp-custom"
          />
        </div>
      )}
    </div>
  )
}