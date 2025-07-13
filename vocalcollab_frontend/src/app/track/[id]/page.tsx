'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchWithAuth } from '@/app/lib/fetchWithAuth'

interface Track {
  id: number
  title: string
  description: string
  audio_file: string
  tags: string
  created_time: string
  cover_image: string | null
  user: string
}

interface Comment {
  id: number
  user: string | null
  content: string
  created_at: string
}

export default function TrackDetailPage() {
  const { id } = useParams()
  const [track, setTrack] = useState<Track | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState<string>('')
  const [commentError, setCommentError] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}/comments/`)
      const data = await res.json()
      setComments(data)
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  useEffect(() => {
    const fetchTrack = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}/`)
      const data = await res.json()
      setTrack(data)
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUser(payload.username)
      } catch (e) {
        console.error('Invalid token')
      }
    }

    if (id) {
      fetchTrack()
      fetchComments()
    }
  }, [id])

  const handleSubmitComment = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setCommentError('Please log in to comment.')
      return
    }
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.')
      return
    }

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (res.ok) {
        setNewComment('')
        setCommentError('')
        fetchComments()
      } else {
        const errData = await res.json()
        setCommentError(errData.detail || 'Failed to post comment.')
      }
    } catch (err) {
      setCommentError('Network error. Please try later.')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?')
    if (!confirmed) return

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/delete/`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchComments()
      } else {
        const errData = await res.json()
        alert(errData.detail || 'Failed to delete comment.')
      }
    } catch (err) {
      alert('Network error while deleting comment.')
    }
  }

  if (!track) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen flex justify-center items-start bg-gradient p-4">
      <div className="card w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4 text-accent">{track.title || 'Untitled Track'}</h1>

        {track.cover_image ? (
          <img
            src={track.cover_image}
            alt="Cover"
            className="w-full h-auto max-h-96 object-cover rounded mb-4"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-4">
            No Cover Image
          </div>
        )}

        <audio controls className="w-full mb-6 rounded">
          <source src={track.audio_file} />
          Your browser does not support the audio element.
        </audio>

        <div className="mb-4 space-y-2 text-sm">
          <p><strong>Description:</strong> {track.description || 'No description'}</p>
          <p><strong>Tags:</strong> {track.tags || 'No tags'}</p>
          <p>
            <strong>Uploaded by:</strong>{' '}
            <a href={`/user/${track.user}`} className="text-blue-600 underline">
              {track.user}
            </a>
          </p>
          <p>
            <strong>Uploaded at:</strong>{' '}
            {new Date(track.created_time).toLocaleString()}
          </p>
        </div>

        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">Comments</h2>

          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {comments.map((comment) => (
                <li key={comment.id} className="border rounded p-3 shadow-sm bg-white">
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                    <span>
                      {comment.user ? (
                        <a href={`/user/${comment.user}`} className="text-blue-600 underline">
                          {comment.user}
                        </a>
                      ) : (
                        'Anonymous'
                      )}{' '}
                      at {new Date(comment.created_at).toLocaleString()}
                    </span>

                    {comment.user === currentUser && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 text-xs underline ml-4"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}

          
          <div className="mt-4">
            <textarea
              className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
              rows={3}
              placeholder="Leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            {commentError && <p className="text-red-500 text-sm mt-2">{commentError}</p>}

            <button
              onClick={handleSubmitComment}
              className="btn mt-3 w-full"
            >
              Submit Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
