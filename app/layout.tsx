import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export const metadata = {
  title: "GitLog AI",
  description: "AI powered changelog generator",
  openGraph: {
    title: "GitLog AI",
  description: "AI powered changelog generator",
    url: "https://gitlog-ai-eight.vercel.app/",
    siteName: "GitLog AI",
    images: [
      {
        url: "https://gitlog-ai-eight.vercel.app/linkPreview.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}