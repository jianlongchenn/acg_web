'use client'

import { useState } from "react"
import { fetchWithAuth } from '@/app/lib/fetchWithAuth'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem('access_token')
    if (!token) {
      setMessage("Please log in to upload.")
      return
    }

    if (!audioFile) {
      setMessage('Please upload an audio file.')
      return
    }

    if (!audioFile.type.startsWith('audio')) {
      setMessage('Uploaded file is not an audio file.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('tags', tags)
    formData.append('audio_file', audioFile)
    if (coverImage) {
      formData.append('cover_image', coverImage)
    }

    try {
      const res = await fetchWithAuth('http://127.0.0.1:8000/api/tracks/', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setMessage('🎉 Upload success!')
        setTitle('')
        setDescription('')
        setTags('')
        setAudioFile(null)
        setCoverImage(null)
      } else {
        const errorData = await res.json()
        console.error('Upload failed:', errorData)
        setMessage('Upload failed: ' + JSON.stringify(errorData))
      }
    } catch (err) {
      console.error('Network error:', err)
      setMessage('Upload failed: Network error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient">
      <div className="card w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-accent">Upload Your Work</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div>
            <p className="text-sm font-semibold mb-1">Upload audio (.mp3/.wav)</p>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Upload cover image (optional)</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          <button type="submit" className="btn w-full">Upload</button>
        </form>

        {message && <p className="text-center mt-4 text-sm text-red-500">{message}</p>}
      </div>
    </div>
  )
}
