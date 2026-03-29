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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#CAFFD6] mb-4">
          How It Works
        </h2>
        <p className="text-sm sm:text-base text-center text-[#7fc28e] max-w-2xl mx-auto mb-10 sm:mb-12">
          The flow stays simple on every screen: connect GitHub, choose a commit range, and generate a readable changelog.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="rounded-2xl border border-[#1e3a2a] bg-[#121f23] px-5 py-6 sm:px-6 sm:py-8">
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="font-semibold text-[#CAFFD6] mb-2">Connect GitHub</h3>
            <p className="text-sm sm:text-base text-[#7fc28e]">
              Log in securely and access your repositories.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1e3a2a] bg-[#121f23] px-5 py-6 sm:px-6 sm:py-8">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-[#CAFFD6] mb-2">Select Repo & Date Range</h3>
            <p className="text-sm sm:text-base text-[#7fc28e]">
              Choose which commits should be included.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1e3a2a] bg-[#121f23] px-5 py-6 sm:px-6 sm:py-8">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-semibold text-[#CAFFD6] mb-2">AI Generates Changelog</h3>
            <p className="text-sm sm:text-base text-[#7fc28e]">
              AI analyzes commits and builds a clean changelog.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
