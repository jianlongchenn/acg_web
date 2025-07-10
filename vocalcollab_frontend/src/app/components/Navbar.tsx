'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        const decoded = parseJwt(token)
        if (decoded && decoded.username) {
          setUsername(decoded.username)
        } else {
          setUsername(null)
        }
      } else {
        setUsername(null)
      }
    }

    checkAuth()
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setUsername(null)
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-accent hover:opacity-90 transition">ACG VocalCollab</h1>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks or tags..."
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <button type="submit" className="btn text-sm px-3 py-1.5">Search</button>
        </form>

        {/* Auth Links */}
        <div>
          {username ? (
            <div className="flex items-center gap-4">
              <Link href={`/user/${username}`}>
                <span className="text-green-600 dark:text-green-400 font-medium underline hover:no-underline">
                  {username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4 text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
              <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}