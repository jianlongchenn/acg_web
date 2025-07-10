import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./styles/globals.css"
import Navbar from "./components/Navbar"

// ✅ 自定义字体：变量形式，方便在 CSS 中使用 var(--font-xxx)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

// ✅ 页面默认元信息
export const metadata: Metadata = {
  title: "ACG VocalCollab",
  description: "A community for vocal covers and collaborations",
}

// ✅ Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ 额外引入 Inter / Fira Code 字体（以防没有加载） */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Fira+Code&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen px-4 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  )
}