'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Track {
  id: number
  title: string
  description: string
  audio_file: string
  cover_image: string | null
  tags: string
  created_time: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://127.0.0.1:8000/api/tracks/')
        const data: Track[] = await res.json()
        const filtered = data.filter(
          (track) =>
            track.title.toLowerCase().includes(query.toLowerCase()) ||
            track.tags.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
      } catch (err) {
        console.error('Error fetching tracks:', err)
      } finally {
        setLoading(false)
      }
    }

    if (query.trim()) {
      fetchResults()
    } else {
      setResults([])
    }
  }, [query])

  return (
    <div className="min-h-screen bg-gradient p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-accent mb-6">
          Search Results for “{query}”
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500">No results found.</p>
        ) : (
          <ul className="space-y-4">
            {results.map((track) => (
              <li key={track.id}>
                <Link href={`/track/${track.id}`} className="block card hover:shadow-md transition">
                  <div className="flex gap-4">
                    {track.cover_image ? (
                      <img
                        src={track.cover_image}
                        alt={track.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-sm text-gray-500 rounded">
                        No Image
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold truncate">{track.title}</h2>
                      <p className="text-sm text-gray-600 truncate">{track.tags}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded: {new Date(track.created_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
