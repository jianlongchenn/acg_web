'use client'

import { useState, useEffect } from "react"
import { fetchWithAuth } from '@/app/lib/fetchWithAuth'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  const openCoverWidget = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget({
      cloudName: 'dc0usebet',
      uploadPreset: 'unsigned_preset',
      folder: 'samples/ecommerce',
      cropping: true,
      croppingAspectRatio: 1146 / 717,
      multiple: false,
      resourceType: 'image',
      maxImageWidth: 1146,
      maxImageHeight: 717
    }, (error: any, result: any) => {
      if (!error && result?.event === 'success') {
        console.log('Cover uploaded:', result.info.secure_url)
        setCoverUrl(result.info.secure_url)
      }
    })
    widget.open()
  }

  const openAudioWidget = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget({
      cloudName: 'dc0usebet',
      uploadPreset: 'unsigned_preset',
      folder: 'samples/ecommerce',
      resourceType: 'video',
      multiple: false,
      clientAllowedFormats: ['mp3', 'wav'],
      transformation: [
        { audio_codec: 'aac' },
        { quality: 'auto' }
      ]
    }, (error: any, result: any) => {
      if (!error && result?.event === 'success') {
        console.log('Audio uploaded:', result.info.secure_url)
        setAudioUrl(result.info.secure_url)
      }
    })
    widget.open()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem('access_token')
    if (!token) {
      setMessage("Please log in to upload.")
      return
    }

    if (!audioUrl) {
      setMessage('Please upload an audio file.')
      return
    }

    const payload = {
      title,
      description,
      tags,
      audio_file: audioUrl,
      cover_image: coverUrl,
    }

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setMessage('🎉 Upload success!')
        setTitle('')
        setDescription('')
        setTags('')
        setCoverUrl(null)
        setAudioUrl(null)
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
      <div className="card w-full max-w-2xl p-4">
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
            <p className="text-sm font-semibold mb-1">Upload cover image</p>
            <button type="button" onClick={openCoverWidget} className="btn w-full">Upload & Crop Cover Image</button>
            {coverUrl && (
              <img src={coverUrl} alt="Preview" className="mt-2 rounded shadow-md" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Upload audio (.mp3/.wav)</p>
            <button type="button" onClick={openAudioWidget} className="btn w-full">Upload & Compress Audio</button>
            {audioUrl && (
              <p className="text-green-600 text-sm mt-1 break-all">Audio uploaded!</p>
            )}
          </div>

          <button type="submit" className="btn w-full">Submit</button>
        </form>

        {message && <p className="text-center mt-4 text-sm text-red-500">{message}</p>}
      </div>
    </div>
  )
}
