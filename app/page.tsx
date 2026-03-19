import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "@/components/UserMenu";
import Hero from "@/components/Hero";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main>
      {/* HERO */}
      {/* <section
        className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 
        bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800"
      >
        <h1 className="text-4xl md:text-6xl font-bold max-w-4xl">
          Generate Beautiful Changelogs in Seconds
        </h1>

        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
          Connect your GitHub repository, select a date range, and generate
          professional AI-powered changelogs instantly.
        </p>

        <div className="py-10">
          {user ? (
          <Link href="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="primary">Login with GitHub</Button>
          </Link>
        )}
        </div>
        
      </section> */}
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
