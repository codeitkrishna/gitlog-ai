"use client";

import { useState } from "react";
import DateRangeSelector from "@/components/DateRangeSelector";
import TagSelector from "@/components/TagSelector";
import CommitList from "@/components/CommitList";
import ChangelogPreview from "@/components/ChangelogPreview";
import type { ChangelogResult, ChangelogTone } from "@/types/changelog";
import type { CommitData, CommitStats } from "@/types/github";

interface GeneratorClientProps {
  owner: string;
  repo: string;
}

type RangeMode = "date" | "tag";
type FetchStatus = "idle" | "loading" | "success" | "error";
type GenerateStatus = "idle" | "loading" | "success" | "error";

export default function GeneratorClient({ owner, repo }: GeneratorClientProps) {
  const [rangeMode, setRangeMode] = useState<RangeMode>("date");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [fromTag, setFromTag] = useState<string | null>(null);
  const [toTag, setToTag] = useState<string | null>(null);
  const [tone, setTone] = useState<ChangelogTone>("technical");
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [wasTruncated, setWasTruncated] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"config" | "commits" | null>(
    "config",
  );
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [changelog, setChangelog] = useState<ChangelogResult | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const [excludeMerge, setExcludeMerge] = useState(false);
  const [excludeDeps, setExcludeDeps] = useState(false);
  const [excludeContaining, setExcludeContaining] = useState("");
  const [stats, setStats] = useState<CommitStats | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  const togglePanel = (panel: "config" | "commits") => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const canFetch =
    rangeMode === "date"
      ? dateRange.from !== null && dateRange.to !== null
      : fromTag !== null && toTag !== null;
  const canGenerate = fetchStatus === "success" && commits.length > 0;

  const handleFetch = async () => {
    if (!canFetch) return;
    setFetchStatus("loading");
    setActivePanel("commits");
    setGenerateStatus("idle");
    setGenerateError(null);
    setChangelog(null);
    setGeneratedAt(null);
    try {
      setFetchError(null);
      const body =
        rangeMode === "date"
          ? {
              since: dateRange.from!.toISOString(),
              until: dateRange.to!.toISOString(),
              excludeMergeCommits: excludeMerge,
              excludeDependencyUpdates: excludeDeps,
              excludeContaining: excludeContaining.trim() || undefined,
            }
          : {
              fromTag,
              toTag,
              excludeMergeCommits: excludeMerge,
              excludeDependencyUpdates: excludeDeps,
              excludeContaining: excludeContaining.trim() || undefined,
            };

      const response = await fetch(`/api/repos/${owner}/${repo}/commits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || data.error || "Failed to fetch commits",
        );

      setCommits(data.commits);
      setWasTruncated(data.wasTruncated);
      setStats(data.stats);
      setEmptyMessage(data.message || null);
      setFetchStatus("success");
      setActivePanel("commits");
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setFetchStatus("error");
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setGenerateStatus("loading");
    setGenerateError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          tone,
          commits,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate changelog");
      }

      setChangelog(data.changelog);
      setGeneratedAt(data.metadata?.generatedAt ?? new Date().toISOString());
      setGenerateStatus("success");
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Failed to generate changelog",
      );
      setGenerateStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1317] bg-[url('/images/heroBg.svg')] bg-cover bg-no-repeat text-[#CAFFD6]">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#238636] flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#22c55e]">
              {owner}/{repo}
            </h1>
            <p className="text-xs text-[#7fc28e]">
              Configure and generate your changelog
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Configuration Card */}
            <div className="bg-[#121f23] rounded-xl overflow-hidden">
              {/* Config Header — always visible, clickable */}
              <button
                onClick={() => togglePanel("config")}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1e3a2a]/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#22c55e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <h2 className="text-base font-semibold text-[#22c55e]">
                    Configuration
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {activePanel === "commits" && commits.length > 0 && (
                    <span className="text-xs text-[#22c55e] bg-[#238636]/20 border border-[#238636]/30 px-2 py-0.5 rounded-full">
                      {commits.length} commits loaded
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-[#7fc28e] transition-transform duration-200 ${
  activePanel === "config" ? "rotate-180" : ""
}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Collapsible content */}
              {activePanel === "config" && (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
  activePanel === "config" ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
}`}>
                  <div className="px-5 pb-5 space-y-5">
                    <div className="h-px bg-[#1e3a2a]" />

                    {/* Commit Range Toggle */}
                    <div>
                      <label className="block text-xs font-medium text-[#7fc28e] mb-2 uppercase tracking-wide">
                        Commit Range
                      </label>
                      <div className="flex rounded-lg border border-[#1e3a2a] overflow-hidden">
                        <button
                          onClick={() => setRangeMode("date")}
                          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                            rangeMode === "date"
                              ? "bg-[#238636] text-white"
                              : "bg-[#0d1317] text-[#7fc28e] hover:text-[#CAFFD6]"
                          }`}
                        >
                          Date Range
                        </button>
                        <button
                          onClick={() => setRangeMode("tag")}
                          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                            rangeMode === "tag"
                              ? "bg-[#238636] text-white"
                              : "bg-[#0d1317] text-[#7fc28e] hover:text-[#CAFFD6]"
                          }`}
                        >
                          Tag Range
                        </button>
                      </div>
                    </div>

                    {/* Date or Tag Selector */}
                    {rangeMode === "date" ? (
                      <DateRangeSelector
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                      />
                    ) : (
                      <TagSelector
                        owner={owner}
                        repo={repo}
                        fromTag={fromTag}
                        toTag={toTag}
                        setFromTag={setFromTag}
                        setToTag={setToTag}
                      />
                    )}

                    <div className="h-px bg-[#1e3a2a]" />

                    {/* Tone Selector */}
                    <div>
                      <label className="block text-xs font-medium text-[#7fc28e] mb-3 uppercase tracking-wide">
                        Output Tone
                      </label>
                      <div className="space-y-2">
                        {[
                          {
                            value: "technical",
                            label: "Technical",
                            desc: "Detailed logs for developers",
                          },
                          {
                            value: "user-friendly",
                            label: "User-Friendly",
                            desc: "Simple language for end users",
                          },
                          {
                            value: "marketing",
                            label: "Marketing",
                            desc: "Exciting updates for announcements",
                          },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border-l-2 ${
                              tone === option.value
                                ? "bg-[#238636]/10 border-l-[#22c55e] border border-[#238636]/30"
                                : "bg-[#0d1317] border-l-transparent border border-[#1e3a2a] hover:border-[#7fc28e]"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                tone === option.value
                                  ? "border-[#22c55e]"
                                  : "border-[#7fc28e]"
                              }`}
                            >
                              {tone === option.value && (
                                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                              )}
                            </div>
                            <input
                              type="radio"
                              name="tone"
                              value={option.value}
                              checked={tone === option.value}
                              onChange={(e) => setTone(e.target.value as ChangelogTone)}
                              className="sr-only"
                            />
                            <div>
                              <div
                                className={`text-sm font-medium ${tone === option.value ? "text-[#22c55e]" : "text-[#CAFFD6]"}`}
                              >
                                {option.label}
                              </div>
                              <div className="text-xs text-[#7fc28e]">
                                {option.desc}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {fetchStatus === "error" && fetchError && (
                      <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-xs text-red-400">{fetchError}</p>
                      </div>
                    )}
                    {/* Filters */}
<div>
  <label className="block text-xs font-medium text-[#7fc28e] mb-3 uppercase tracking-wide">
    Filters
  </label>
  <div className="space-y-2">
    {/* Exclude merge commits */}
    <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer bg-[#0d1317] border border-[#1e3a2a] hover:border-[#7fc28e] transition-colors">
      <div
        onClick={() => setExcludeMerge(!excludeMerge)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
          excludeMerge ? "bg-[#238636] border-[#22c55e]" : "border-[#7fc28e]"
        }`}
      >
        {excludeMerge && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={excludeMerge} onChange={(e) => setExcludeMerge(e.target.checked)} className="sr-only" />
      <div>
        <div className="text-sm text-[#CAFFD6]">Exclude merge commits</div>
        <div className="text-xs text-[#7fc28e]">Remove &quot;Merge branch...&quot; commits</div>
      </div>
    </label>

    {/* Exclude dependency updates */}
    <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer bg-[#0d1117] border border-[#1e3a2a] hover:border-[#7fc28e] transition-colors">
      <div
        onClick={() => setExcludeDeps(!excludeDeps)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
          excludeDeps ? "bg-[#238636] border-[#22c55e]" : "border-[#7fc28e]"
        }`}
      >
        {excludeDeps && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={excludeDeps} onChange={(e) => setExcludeDeps(e.target.checked)} className="sr-only" />
      <div>
        <div className="text-sm text-[#CAFFD6]">Exclude dependency updates</div>
        <div className="text-xs text-[#7fc28e]">Remove Dependabot and bump commits</div>
      </div>
    </label>

    {/* Exclude containing */}
    <div className="px-3 py-2.5 rounded-lg bg-[#0d1117] border border-[#1e3a2a]">
      <div className="text-sm text-[#CAFFD6] mb-1.5">Exclude commits containing</div>
      <input
        type="text"
        value={excludeContaining}
        onChange={(e) => setExcludeContaining(e.target.value)}
        placeholder='e.g. "typo", "wip", "test"'
        className="w-full bg-[#121f23] border border-[#1e3a2a] rounded-md px-2.5 py-1.5 text-xs text-[#CAFFD6] placeholder-[#7fc28e]/50 focus:outline-none focus:border-[#22c55e] transition-colors"
      />
    </div>
  </div>
</div>
                    {/* Fetch Button */}
                    <button
                      onClick={handleFetch}
                      disabled={!canFetch || fetchStatus === "loading"}
                      className={`w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        !canFetch || fetchStatus === "loading"
                          ? "bg-[#238636]/30 text-[#7fc28e] cursor-not-allowed"
                          : "bg-[#238636] hover:bg-[#2ea043] text-white"
                      }`}
                    >
                      {fetchStatus === "loading" ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Fetching Commits...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          {fetchStatus === "success"
                            ? "Refetch Commits"
                            : "Fetch Commits"}
                        </>
                      )}
                    </button>

                    {fetchStatus === "success" && commits.length > 0 && (
                      <p className="text-xs text-[#7fc28e] text-center">
                        {commits.length} commits loaded — now generate your
                        changelog
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Commits Card */}
            <div className="bg-[#121f23] rounded-xl overflow-hidden">
              {/* Commits Header — always visible */}
              <button
                onClick={() => togglePanel("commits")}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1e3a2a]/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#22c55e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-base font-semibold text-[#22c55e]">
                    {fetchStatus === "success" && commits.length > 0
                      ? `Commit History (${commits.length})`
                      : "Commit History"}
                  </h2>
                </div>
                <svg
                  className={`w-4 h-4 text-[#7fc28e] transition-transform duration-200 ${
  activePanel === "commits" ? "rotate-180" : ""
}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Collapsible commits content */}
              {activePanel === "commits" && (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
  activePanel === "commits" ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
}`}>
  {fetchStatus === "idle" && (
    <div className="px-4 pb-5">
      <p className="text-xs text-[#7fc28e]">Select a range and click Fetch Commits</p>
    </div>
  )}
  {fetchStatus === "loading" && (
    <div className="px-4 py-6 flex items-center justify-center gap-2">
      <svg className="w-4 h-4 animate-spin text-[#22c55e]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm text-[#7fc28e]">Fetching commits...</span>
    </div>
  )}
  {fetchStatus === "error" && (
    <p className="text-xs text-red-400 px-4 pb-4">Failed to load commits. Try again.</p>
  )}
  {/* Stats bar — Task 5.11 */}
{fetchStatus === "success" && stats && commits.length > 0 && (
  <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-[#1e3a2a]">
    <div className="bg-[#0d1317] rounded-lg px-3 py-2">
      <div className="text-xs text-[#7fc28e] mb-0.5">Commits</div>
      <div className="text-sm font-bold text-[#22c55e]">{stats.total}</div>
    </div>
    <div className="bg-[#0d1317] rounded-lg px-3 py-2">
      <div className="text-xs text-[#7fc28e] mb-0.5">Contributors</div>
      <div className="text-sm font-bold text-[#22c55e]">{stats.contributors}</div>
    </div>
    <div className="bg-[#0d1317] rounded-lg px-3 py-2">
      <div className="text-xs text-[#7fc28e] mb-0.5">Files Changed</div>
      <div className="text-sm font-bold text-[#22c55e]">{stats.totalFilesChanged}</div>
    </div>
    <div className="bg-[#0d1317] rounded-lg px-3 py-2">
      <div className="text-xs text-[#7fc28e] mb-0.5">Lines</div>
      <div className="text-sm font-bold">
        <span className="text-[#22c55e]">+{stats.totalAdditions}</span>
        <span className="text-red-400 ml-1">-{stats.totalDeletions}</span>
      </div>
    </div>
    {stats.filteredOut > 0 && (
      <div className="col-span-2 bg-[#0d1117] rounded-lg px-3 py-2">
        <div className="text-xs text-[#7fc28e]">
          {stats.filteredOut} commits filtered out by your filters
        </div>
      </div>
    )}
  </div>
)}

{/* Edge case: no commits found */}
{fetchStatus === "success" && commits.length === 0 && (
  <div className="px-4 py-8 text-center">
    <div className="w-10 h-10 rounded-full bg-[#0d1117] border border-[#1e3a2a] flex items-center justify-center mx-auto mb-3">
      <svg className="w-5 h-5 text-[#7fc28e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-sm font-medium text-[#CAFFD6] mb-1">No commits found</p>
    <p className="text-xs text-[#7fc28e] max-w-xs mx-auto">
      {emptyMessage || "Try a different date range or adjust your filters."}
    </p>
  </div>
)}
  {fetchStatus === "success" && (
    <CommitList commits={commits} wasTruncated={wasTruncated} />
  )}
</div>
              )}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2">
            <div className="bg-[#121f23] rounded-xl overflow-hidden min-h-[600px] flex flex-col">
              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#1e3a2a]">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#22c55e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-[#22c55e]">
                    Generated Changelog
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || generateStatus === "loading"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      !canGenerate || generateStatus === "loading"
                        ? "text-[#7fc28e] border border-[#1e3a2a] opacity-50 cursor-not-allowed"
                        : "text-white bg-[#238636] hover:bg-[#2ea043]"
                    }`}
                  >
                    {generateStatus === "loading" ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Analyzing commits...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {generateStatus === "success" ? "Regenerate" : "Generate Changelog"}
                      </>
                    )}
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#7fc28e] border border-[#1e3a2a] rounded-lg opacity-40 cursor-not-allowed"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#7fc28e] border border-[#1e3a2a] rounded-lg opacity-40 cursor-not-allowed"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#238636]/40 rounded-lg cursor-not-allowed"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save to History
                  </button>
                </div>
              </div>

              {generateStatus === "loading" ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-[#0d1317] border border-[#1e3a2a] flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-7 h-7 text-[#22c55e] animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-[#CAFFD6] mb-1">
                      Analyzing your commits
                    </h3>
                    <p className="text-sm text-[#7fc28e] max-w-xs mx-auto">
                      AI is grouping changes and rewriting them into a clean changelog.
                    </p>
                  </div>
                </div>
              ) : generateStatus === "error" ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-7 h-7 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-[#CAFFD6] mb-1">
                      Changelog generation failed
                    </h3>
                    <p className="text-sm text-red-400">{generateError}</p>
                  </div>
                </div>
              ) : changelog ? (
                <>
                  <div className="px-4 sm:px-6 py-3 border-b border-[#1e3a2a] bg-[#0d1317]/40">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#7fc28e]">
                      <span className="text-[#22c55e] font-medium">{owner}/{repo}</span>
                      <span>•</span>
                      <span>{tone} tone</span>
                      <span>•</span>
                      <span>{commits.length} commits analyzed</span>
                      {generatedAt && (
                        <>
                          <span>•</span>
                          <span>Generated {new Date(generatedAt).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChangelogPreview changelog={changelog} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-[#0d1317] border border-[#1e3a2a] flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-7 h-7 text-[#7fc28e]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-[#CAFFD6] mb-1">
                      No Changelog Generated Yet
                    </h3>
                    <p className="text-sm text-[#7fc28e] max-w-xs mx-auto">
                      {fetchStatus === "success" && commits.length > 0
                        ? 'Commits loaded! Click "Generate Changelog" to continue'
                        : "Fetch commits first, then generate your changelog"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ```

// **How it works:**
// ```
// Page loads
//   → configCollapsed = false → full config visible, chevron points up

// User fetches commits successfully
//   → configCollapsed = true → config collapses to just the header
//   → header shows "X commits loaded" green badge
//   → chevron points down

// User clicks header
//   → toggles open/closed manually anytime
