import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="bg-[#0D1317]">

      {/* HERO SECTION */}
      <Hero user={!!user} />

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

    </main>
  );
}