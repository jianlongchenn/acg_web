'use client'

import { useState, useEffect } from "react"
import { fetchWithAuth } from '@/app/lib/fetchWithAuth'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // 动态引入 cloudinary widget 脚本
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  // 初始化 Upload Widget
  const openCloudinaryWidget = () => {
    // @ts-ignore
    const myWidget = window.cloudinary.createUploadWidget({
      cloudName: 'your_cloud_name',
      uploadPreset: 'your_upload_preset',
      cropping: true,
      croppingAspectRatio: 1146 / 717,
      multiple: false,
      resourceType: 'image',
      maxImageWidth: 1146,
      maxImageHeight: 717,
    }, (error: any, result: any) => {
      if (!error && result && result.event === "success") {
        console.log('Uploaded image URL:', result.info.secure_url)
        setCoverUrl(result.info.secure_url)
      }
    })
    myWidget.open()
  }

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
    if (coverUrl) {
      formData.append('cover_image', coverUrl)
    }

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setMessage('🎉 Upload success!')
        setTitle('')
        setDescription('')
        setTags('')
        setAudioFile(null)
        setCoverUrl(null)
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
            <button
              type="button"
              onClick={openCloudinaryWidget}
              className="btn w-full"
            >
              Upload & Crop Image via Cloudinary
            </button>
            {coverUrl && (
              <img src={coverUrl} alt="Cover preview" className="mt-2 rounded" />
            )}
          </div>

          <button type="submit" className="btn w-full">Upload</button>
        </form>

        {message && <p className="text-center mt-4 text-sm text-red-500">{message}</p>}
      </div>
    </div>
  )
}
