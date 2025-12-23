import { useState, useEffect } from 'react'
import { useTeams } from '../hooks/useTeams'

export default function NoteForm({ note, onSubmit, onCancel, loading, currentUserId }) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [teamId, setTeamId] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [errors, setErrors] = useState({})
  const { teams, loading: teamsLoading } = useTeams()

  useEffect(() => {
    if (note) {
      setContent(note.content || '')
      setCategory(note.category || '')
      setTeamId(note.team_id || '')
      setIsAnonymous(!note.created_by)
    } else {
      setContent('')
      setCategory('')
      setTeamId('')
      setIsAnonymous(true)
    }
    setErrors({})
  }, [note])

  const validate = () => {
    const newErrors = {}
    if (!content.trim()) {
      newErrors.content = 'Note content is required'
    }
    if (!teamId) {
      newErrors.teamId = 'Please select a team'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        content: content.trim(),
        category: category.trim() || null,
        team_id: teamId,
        created_by: isAnonymous ? null : currentUserId,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="team" className="block text-sm font-medium text-gray-700">
          Team <span className="text-red-500">*</span>
        </label>
        <select
          id="team"
          required
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          disabled={!!note || teamsLoading}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.teamId ? 'border-red-300' : ''
          }`}
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {errors.teamId && (
          <p className="mt-1 text-sm text-red-600">{errors.teamId}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          rows={6}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.content ? 'border-red-300' : ''
          }`}
          placeholder="Enter note content..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., General, Important, Meeting Notes"
        />
      </div>

      {!note && (
        <div className="flex items-center">
          <input
            id="anonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
            Create as anonymous note (not attributed to admin)
          </label>
        </div>
      )}

      {note && note.created_by && (
        <div className="rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            This note was created by an admin and cannot be changed to anonymous.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
        </button>
      </div>
    </form>
  )
}

