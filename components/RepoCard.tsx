"use client";

import { Repository } from "@/types/github";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface RepoCardProps {
  repo: Repository;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/generate/${repo.owner}/${repo.name}`);
  };

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      Python: "#3572A5",
      Java: "#b07219",
      Go: "#00ADD8",
      Rust: "#dea584",
      Ruby: "#701516",
      PHP: "#4F5D95",
      Swift: "#ffac45",
      Kotlin: "#A97BFF",
    };
    return colors[language || ""] || "#8b949e";
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#121F23] border border-[#30363d] rounded-lg p-6 hover:border-[#22c55e] hover:shadow-lg transition-all cursor-pointer group opacity-85"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-[#CAFFD6]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-[#22c55e] font-semibold group-hover:underline truncate">
            {repo.name}
          </h3>
        </div>
        {repo.isPrivate && (
          <span className="px-2 py-1 text-xs bg-[#194f45] text-[#CAFFD6] rounded border border-[#30363d]">
            PRIVATE
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[#CAFFD6] text-sm mb-4 line-clamp-2 min-h-10">
        {repo.description || "No description provided"}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-[#CAFFD6]">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
            />
            <span>{repo.language}</span>
          </div>
        )}

        {repo.stars > 0 && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>{repo.stars}</span>
          </div>
        )}

        <div className="ml-auto text-[#caffd6]">
          {repo.updatedAt && (
            <div className="ml-auto">
              Updated{" "}
              {formatDistanceToNow(new Date(repo.updatedAt), {
                addSuffix: true,
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
