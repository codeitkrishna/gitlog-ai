export default function RepoCardSkeleton() {
  return (
    <div className="bg-[#121F23] border border-[#1e3a2a] rounded-xl p-4 sm:p-5 animate-pulse opacity-25 h-full">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-[#1e3a2a] rounded" />
          <div className="h-5 bg-[#1e3a2a] rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-[#1e3a2a] rounded w-full" />
        <div className="h-4 bg-[#1e3a2a] rounded w-3/4" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-[#1e3a2a] rounded w-20" />
        <div className="h-4 bg-[#1e3a2a] rounded w-16" />
      </div>
    </div>
  )
}
