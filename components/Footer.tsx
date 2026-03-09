export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-10">

      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">

        <p>© {new Date().getFullYear()} GitLog AI</p>

        <div className="flex gap-6">
          <a href="#">GitHub</a>
          <a href="#">Twitter</a>
          <a href="#">Documentation</a>
        </div>

      </div>

    </footer>
  )
}