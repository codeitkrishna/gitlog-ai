export default function RepoCardSkeleton() {
  return (
    <div className="bg-[#121F23] border border-[#30363d] rounded-lg p-6 animate-pulse opacity-25">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-[#30363d] rounded" />
          <div className="h-5 bg-[#30363d] rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-[#30363d] rounded w-full" />
        <div className="h-4 bg-[#30363d] rounded w-3/4" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-[#30363d] rounded w-20" />
        <div className="h-4 bg-[#30363d] rounded w-16" />
      </div>
    </div>
  )
}