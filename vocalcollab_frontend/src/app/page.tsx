'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Track {
  id: number
  title: string
  tags: string
  cover_image: string | null
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    const fetchTracks = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/`)
      const data = await res.json()
      setTracks(data)
    }
    fetchTracks()
  }, [])

  return (
    <main className="p-8 min-h-screen bg-background text-foreground">
     
      <div className="flex justify-end mb-8">
        <Link href="/upload">
          <button className="btn">Upload Your Work</button>
        </Link>
      </div>

    
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tracks.map((track) => (
          <Link key={track.id} href={`/track/${track.id}`}>
            <div className="card cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
              {track.cover_image ? (
                <img
                  src={track.cover_image}
                  alt={track.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 text-gray-500 flex items-center justify-center rounded mb-3">
                  No Cover Image
                </div>
              )}
              <h2 className="text-accent font-semibold truncate">{track.title || 'Untitled'}</h2>
              <p className="text-sm text-gray-500 truncate">{track.tags || 'No tags'}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
