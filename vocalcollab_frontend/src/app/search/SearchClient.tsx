// app/search/SearchClient.tsx
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

export default function SearchClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/`)
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
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for “{query}”</h1>
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500">No results found.</p>
      ) : (
        <ul className="grid gap-6">
          {results.map((track) => (
            <li key={track.id} className="border p-4 rounded hover:shadow transition">
              <Link href={`/track/${track.id}`}>
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
                  <div>
                    <h2 className="text-lg font-semibold">{track.title}</h2>
                    <p className="text-sm text-gray-600">{track.tags}</p>
                    <p className="text-xs text-gray-400">
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
  )
}
