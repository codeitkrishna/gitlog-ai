// import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";

export default async function Home() {

  return (
    <main>

      {/* HERO SECTION */}
      <Hero/>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="font-semibold">Connect GitHub</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Log in securely and access your repositories.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold">Select Repo & Date Range</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose which commits should be included.
            </p>
          </div>

          <div>
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-semibold">AI Generates Changelog</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI analyzes commits and builds a clean changelog.
            </p>
          </div>
        </div>
      </section>

      {/* EXAMPLE OUTPUT */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Example Output
          </h2>

          <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-6 font-mono text-sm">
            <pre>
              {`## 🚀 Features
                - User Authentication: Added secure login
                - Dashboard: New project overview page

                ## 🐛 Bug Fixes
                - Fixed mobile responsive issues
                - Resolved email notification bug
              `}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
