import Link from "next/link";
import Image from "next/image";

export default function Hero({ user }: { user?: boolean }) {
  return (
    <section className="relative">
      <section className="w-full bg-[url('/images/heroBg.svg')] bg-cover bg-no-repeat z-10 border-b border-[#22c55e]">
        {/* Top green radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[220px] sm:w-[700px] sm:h-[320px] z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(35,134,54,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10">
          {/* Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#238636]/10 border border-[#238636]/30 text-green-400 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase mb-6 sm:mb-8 max-w-full">
            <Image src="/images/star.svg" alt="star" height={18} width={18} />
            AI-Powered Assistant
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-4xl">
            <span className="text-[#15E160]">
              Generate Changelogs in Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 sm:mt-6 text-[#CAFFD6] text-base sm:text-lg max-w-xl leading-relaxed px-2">
            Automate your release notes directly from your GitHub commits. Built
            for developers who value speed and clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full max-w-sm sm:max-w-none sm:w-auto">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-[#238636] hover:bg-[#2ea043] text-[#CAFFD6] font-semibold px-5 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#238636] hover:bg-[#2ea043] text-[#CAFFD6] font-semibold px-5 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Login with GitHub
              </Link>
            )}
          </div>

          {/* <p className="mt-6 text-gray-600 text-xs tracking-wide">
            Trusted by 2,000+ developers
          </p> */}
        </div>

        <div className="relative flex flex-col items-center justify-end opacity-85 px-4 sm:px-6">
          <Image
            src="/images/changelogsHeroComponent.svg"
            alt="Picture of the author"
            width={1000} // These act as placeholders
            height={0} // Set your desired height here
            sizes="100vw"
            className="h-auto w-full max-w-5xl" // Tailwind forces the height and auto-scales width
          />
        </div>
      </section>
    </section>
  );
}
