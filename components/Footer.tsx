export default function Footer() {
  return (
    <footer className="border-t border-[#1e3a2a] bg-[#0D1317] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#7fc28e] text-center md:text-left">
        <p>© {new Date().getFullYear()} GitLog AI</p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="hover:text-[#CAFFD6] transition-colors">GitHub</a>
          <a href="#" className="hover:text-[#CAFFD6] transition-colors">Twitter</a>
          <a href="#" className="hover:text-[#CAFFD6] transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  )
}
