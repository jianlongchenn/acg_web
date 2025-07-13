'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchWithAuth } from '@/app/lib/fetchWithAuth'

interface Track {
  id: number
  title: string
  tags: string
  cover_image: string | null
  user: string
}

interface User {
  username: string
}

export default function UserPage() {
  const { username } = useParams()
  const [tracks, setTracks] = useState<Track[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!username) return

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setCurrentUser(payload.username)

      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/is_following/`, {
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (typeof data.is_following === 'boolean') {
            setIsFollowing(data.is_following)
          }
        })
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/tracks/`)
      .then(res => res.json())
      .then(setTracks)

    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/followers/`)
      .then(res => res.json())
      .then(setFollowers)

    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/following/`)
      .then(res => res.json())
      .then(setFollowing)
  }, [username])

  const handleToggleFollow = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/follow/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setIsFollowing(prev => !prev)
        const followerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/followers/`)
        const updatedFollowers = await followerRes.json()
        setFollowers(updatedFollowers)
      }
    } catch (err) {
      console.error('Follow error:', err)
    }
    setLoading(false)
  }

  const handleDeleteTrack = async (trackId: number) => {
    const confirm = window.confirm('Are you sure you want to delete this track? This cannot be undone.')
    if (!confirm) return

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTracks(prev => prev.filter(t => t.id !== trackId))
      } else {
        alert('Failed to delete the track.')
      }
    } catch (err) {
      alert('Network error while deleting.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient p-6">
      <div className="card max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-accent">{username}'s Page</h1>
          {currentUser && currentUser !== username && (
            <button
              onClick={handleToggleFollow}
              disabled={loading}
              className={`btn ${isFollowing ? 'bg-gray-400 hover:bg-gray-500' : ''}`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        {/* Followers */}
        <div>
          <p
            className="font-semibold cursor-pointer underline"
            onClick={() => setShowFollowers(!showFollowers)}
          >
            Followers ({followers.length})
          </p>
          {showFollowers && (
            <div className="mt-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {followers.map(user => (
                  <Link key={user.username} href={`/user/${user.username}`}
                        className="bg-gray-100 text-sm px-3 py-1 rounded-full hover:underline whitespace-nowrap">
                    {user.username}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Following */}
        <div>
          <p
            className="font-semibold cursor-pointer underline"
            onClick={() => setShowFollowing(!showFollowing)}
          >
            Following ({following.length})
          </p>
          {showFollowing && (
            <div className="mt-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {following.map(user => (
                  <Link key={user.username} href={`/user/${user.username}`}
                        className="bg-green-100 text-sm px-3 py-1 rounded-full hover:underline whitespace-nowrap">
                    {user.username}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tracks */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Uploaded Tracks</h2>
          {tracks.length === 0 ? (
            <p className="text-gray-500">No uploads yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tracks.map(track => (
                <div key={track.id} className="relative border rounded-lg shadow-sm hover:shadow-md transition">
                  <Link href={`/track/${track.id}`}>
                    {track.cover_image ? (
                      <img
                        src={track.cover_image}
                        alt={track.title}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                        No Cover
                      </div>
                    )}
                    <div className="p-2">
                      <h3 className="text-sm font-semibold truncate">{track.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{track.tags}</p>
                    </div>
                  </Link>
                  {currentUser === username && (
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="absolute top-2 right-2 text-xs text-red-600 bg-white px-2 py-0.5 rounded shadow-sm hover:bg-red-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
