import { useParams } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'
import { useTeam } from '../hooks/useTeam'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TeamDetail() {
  const { teamId } = useParams()
  const { team, loading: teamLoading } = useTeam(teamId)
  const { notes, loading: notesLoading, refetch, createNote } = useNotes(teamId)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await createNote(content, category || null, null) // Anonymous note

    if (result.error) {
      setError(result.error)
    } else {
      setContent('')
      setCategory('')
    }
    setSubmitting(false)
  }

  if (teamLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading team...</div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-600">Team not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{team.name}</h2>
        {team.description && (
          <p className="text-base text-gray-600 dark:text-gray-400">{team.description}</p>
        )}
      </div>

      {/* Create Note Form */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add a Note
        </h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="content"
              rows={4}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category (optional)
            </label>
            <input
              type="text"
              id="category"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., General, Important"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Note'}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notesLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-600">Loading notes...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No notes yet. Be the first to add one!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {note.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                      {note.category}
                    </span>
                  )}
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(note.created_at).toLocaleString()}
                    {note.created_by && ' • By Admin'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

