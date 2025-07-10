'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/register/', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        alert('Register success! Please login.')
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data?.message || 'Register failed. Please retry.')
      }
    } catch (err) {
      console.error(err)
      setError('Request failed. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-accent">Create Account</h1>

        <div className="space-y-4">
          <input
            className="border w-full px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="border w-full px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            className="btn w-full"
          >
            Register
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
