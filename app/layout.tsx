import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export const metadata = {
  title: "GitLog AI",
  description: "AI powered changelog generator",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

        <Navbar />

        {children}

        <Footer />

      </body>

    </html>
  )
}