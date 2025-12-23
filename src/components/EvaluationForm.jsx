import { useState, useEffect } from 'react'
import { useTeams } from '../hooks/useTeams'
import StarRating from './StarRating'

export default function EvaluationForm({ evaluation, onSubmit, onCancel, loading }) {
  const [teamId, setTeamId] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [weekStartDate, setWeekStartDate] = useState('')
  const [errors, setErrors] = useState({})
  const { teams, loading: teamsLoading } = useTeams()

  // Get current week start date (Monday)
  const getCurrentWeekStart = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (evaluation) {
      setTeamId(evaluation.team_id || '')
      setRating(evaluation.rating || 0)
      setFeedback(evaluation.feedback || '')
      setWeekStartDate(evaluation.week_start_date || '')
    } else {
      setTeamId('')
      setRating(0)
      setFeedback('')
      setWeekStartDate(getCurrentWeekStart())
    }
    setErrors({})
  }, [evaluation])

  const validate = () => {
    const newErrors = {}
    if (!teamId) {
      newErrors.teamId = 'Please select a team'
    }
    if (!weekStartDate) {
      newErrors.weekStartDate = 'Please select a week start date'
    }
    if (rating === 0) {
      newErrors.rating = 'Please provide a rating'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        team_id: teamId,
        rating: rating,
        feedback: feedback.trim() || null,
        week_start_date: weekStartDate,
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
          disabled={!!evaluation || teamsLoading}
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
        <label htmlFor="week-start" className="block text-sm font-medium text-gray-700">
          Week Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="week-start"
          required
          value={weekStartDate}
          onChange={(e) => setWeekStartDate(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.weekStartDate ? 'border-red-300' : ''
          }`}
        />
        {errors.weekStartDate && (
          <p className="mt-1 text-sm text-red-600">{errors.weekStartDate}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Select the Monday of the week being evaluated
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onRatingChange={setRating} editable={true} />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
          Feedback
        </label>
        <textarea
          id="feedback"
          rows={6}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter feedback for this week (optional)..."
        />
      </div>

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
          {loading ? 'Saving...' : evaluation ? 'Update Evaluation' : 'Create Evaluation'}
        </button>
      </div>
    </form>
  )
}

