import Link from "next/link"
import Button from "@/components/ui/Button";

export default function Hero({ user }: { user?: boolean }) {
  return (
    <section className="w-full bg-[#0B1220] text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}
        <div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm mb-8 font-medium tracking-wide z-10">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            NEW: AI-POWERED SUMMARIES
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Generate Beautiful
            <span className="text-green-500"> Changelogs </span>
            in Seconds
          </h1>

          {/* Description */}
          <p className="mt-6 text-gray-400 max-w-xl text-lg">
            Automate your release notes directly from your GitHub commits.
            Built for developers who value speed and clarity.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">

            {user ? (
              <Link
                href="/dashboard"
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-md font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#238636] hover:bg-green-600 px-6 py-3 rounded-md font-medium"
              >
                Login with Github
              </Link>
            )}

            <button className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-md text-gray-300">
              View Demo
            </button>
          </div>

          {/* Trust */}
          <div className="mt-8 text-gray-500 text-sm">
            Trusted by 2,000+ developers
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative">

          <div className="bg-[#111827] border border-gray-700 rounded-xl shadow-2xl p-6">

            {/* Fake Window Bar */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>

            {/* Changelog Content */}
            <div className="font-mono text-sm text-gray-300 space-y-3">

              <p className="text-green-400">
                ## [1.4.2] - 2023-11-24
              </p>

              <p className="italic text-gray-400">
                &quot;The Optimization Update&quot;
              </p>

              <p className="text-white font-semibold">
                🚀 Features
              </p>

              <ul className="list-disc ml-6 space-y-1">
                <li>Implement automated Slack notifications</li>
                <li>Add AI-driven summarization</li>
              </ul>

              <p className="text-white font-semibold mt-4">
                🐞 Bug Fixes
              </p>

              <ul className="list-disc ml-6 space-y-1">
                <li>Resolved race condition in webhooks</li>
                <li>Fixed pagination on high-traffic repos</li>
              </ul>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}