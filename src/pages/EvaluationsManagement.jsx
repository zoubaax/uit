import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAllEvaluations } from '../hooks/useAllEvaluations'
import { useTeams } from '../hooks/useTeams'
import { supabase } from '../lib/supabase'
import DeleteConfirmation from '../components/DeleteConfirmation'

// Move StarRating component outside
const StarRating = ({ rating, onRatingChange, editable = false }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onRatingChange?.(star)}
          disabled={!editable}
          className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {editable && (
        <span className="ml-2 text-sm text-gray-400">
          {rating}/5
        </span>
      )}
    </div>
  )
}

// Move EvaluationFormModal outside the main component
const EvaluationFormModal = ({ 
  showFormModal, 
  editingEvaluation, 
  formData, 
  formLoading, 
  error,
  teams,
  handleFormChange, 
  handleRatingChange,
  handleSubmit, 
  handleCancelForm 
}) => {
  if (!showFormModal) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 transition-all duration-300 animate-fade-in"
        onClick={handleCancelForm}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-2xl shadow-3xl transform transition-all duration-300 animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-emerald-700 to-teal-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingEvaluation ? 'Edit Evaluation' : 'Create New Evaluation'}
                </h2>
                <p className="text-emerald-300 mt-1">
                  {editingEvaluation ? 'Update weekly evaluation' : 'Add a new weekly evaluation for a team'}
                </p>
              </div>
              <button
                onClick={handleCancelForm}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={formLoading}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-900/20 border border-red-800 rounded-xl">
              <div className="flex items-center text-red-400">
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="team_id" className="block text-sm font-medium text-gray-300 mb-2">
                    Team *
                  </label>
                  <select
                    id="team_id"
                    name="team_id"
                    required
                    value={formData.team_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    disabled={formLoading}
                    key={`team-${editingEvaluation?.id || 'new'}`}
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="week_start_date" className="block text-sm font-medium text-gray-300 mb-2">
                    Week Start Date *
                  </label>
                  <input
                    type="date"
                    id="week_start_date"
                    name="week_start_date"
                    required
                    value={formData.week_start_date}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    disabled={formLoading}
                    key={`week-${editingEvaluation?.id || 'new'}`}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Select Monday of the evaluation week
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating *
                </label>
                <StarRating 
                  rating={formData.rating} 
                  onRatingChange={handleRatingChange}
                  editable={!formLoading}
                />
                <p className="mt-2 text-sm text-gray-400">
                  Rate the team's performance for this week
                </p>
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows={6}
                  value={formData.feedback}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all resize-none"
                  placeholder="Enter your feedback, highlights, areas for improvement, and goals for next week..."
                  disabled={formLoading}
                  key={`feedback-${editingEvaluation?.id || 'new'}`}
                />
                <p className="mt-2 text-sm text-gray-400">
                  Include overall feedback, key highlights, areas for improvement, and goals for next week
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-6 py-3 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 focus:ring-offset-gray-900 transition-all"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
                >
                  {formLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingEvaluation ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editingEvaluation ? 'Update Evaluation' : 'Create Evaluation'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Loading Overlay */}
          {formLoading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
                <p className="mt-4 text-gray-300 font-medium">
                  {editingEvaluation ? 'Updating evaluation...' : 'Creating evaluation...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Move WeeklySummaryModal outside the main component
const WeeklySummaryModal = ({ 
  showSummary, 
  summaryWeek, 
  evaluations, 
  teams, 
  getTeamName, 
  getTeamColor, 
  formatWeekDate,
  setShowSummary 
}) => {
  if (!showSummary) return null

  const weekEvaluations = evaluations.filter(e => e.week_start_date === summaryWeek)
  const weekStart = new Date(summaryWeek)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Calculate statistics
  const averageRating = weekEvaluations.length > 0 
    ? (weekEvaluations.reduce((sum, evalItem) => sum + (evalItem.rating || 0), 0) / weekEvaluations.length).toFixed(1)
    : 0
  
  const highestRated = weekEvaluations.length > 0 
    ? weekEvaluations.reduce((prev, current) => (prev.rating || 0) > (current.rating || 0) ? prev : current)
    : null
  
  const lowestRated = weekEvaluations.length > 0 
    ? weekEvaluations.reduce((prev, current) => (prev.rating || 0) < (current.rating || 0) ? prev : current)
    : null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 transition-all duration-300 animate-fade-in"
        onClick={() => setShowSummary(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-2xl shadow-3xl transform transition-all duration-300 animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-700 to-indigo-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Weekly Summary</h2>
                <p className="text-blue-300 mt-1">
                  {formatWeekDate(summaryWeek)}
                </p>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Summary Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-2xl p-6 shadow-sm border border-blue-800/30">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400 mb-2">Average Rating</p>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <StarRating rating={Math.round(averageRating)} />
                    <span className="text-3xl font-bold text-white">{averageRating}</span>
                  </div>
                  <p className="text-sm text-gray-400">out of 5</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-2xl p-6 shadow-sm border border-emerald-800/30">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400 mb-2">Teams Evaluated</p>
                  <p className="text-3xl font-bold text-white">{weekEvaluations.length}</p>
                  <p className="text-sm text-gray-400">out of {teams.length} teams</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-2xl p-6 shadow-sm border border-amber-800/30">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400 mb-2">Week Coverage</p>
                  <p className="text-3xl font-bold text-white">
                    {teams.length > 0 ? Math.round((weekEvaluations.length / teams.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-400">of teams evaluated</p>
                </div>
              </div>
            </div>

            {highestRated && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
                <div className="bg-gradient-to-r from-emerald-900/10 to-gray-800/10 rounded-xl border border-emerald-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-white">{getTeamName(highestRated.team_id)}</h4>
                      <p className="text-sm text-gray-400 mt-1">Highest rated team this week</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={highestRated.rating || 0} />
                      <span className="text-2xl font-bold text-emerald-400">{highestRated.rating || 0}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">All Evaluations</h3>
              {weekEvaluations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-sm font-medium text-gray-100">No evaluations for this week</h3>
                  <p className="mt-1 text-sm text-gray-400">Create evaluations to see the summary</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {weekEvaluations.map((evaluation) => {
                    const team = teams.find(t => t.id === evaluation.team_id)
                    const teamColor = getTeamColor(evaluation.team_id)
                    
                    return (
                      <div key={evaluation.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`${teamColor} w-3 h-3 rounded-full`}></div>
                              <h4 className="text-lg font-semibold text-white">
                                {team?.name || 'Unknown Team'}
                              </h4>
                              <div className="flex items-center">
                                <StarRating rating={evaluation.rating || 0} />
                                <span className="ml-2 text-sm font-medium text-gray-400">
                                  {evaluation.rating || 0}/5
                                </span>
                              </div>
                            </div>
                            
                            {evaluation.feedback && (
                              <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                                {evaluation.feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function EvaluationsManagement() {
  const { evaluations, loading, refetch } = useAllEvaluations()
  const { teams } = useTeams()
  
  const [editingEvaluation, setEditingEvaluation] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [deleteEvaluation, setDeleteEvaluation] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filter states
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedWeek, setSelectedWeek] = useState('')
  
  // Summary state
  const [summaryWeek, setSummaryWeek] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    team_id: '',
    week_start_date: '',
    rating: 3,
    feedback: ''
  })

  // Get unique weeks from evaluations
  const availableWeeks = useMemo(() => {
    const weeks = new Set()
    evaluations.forEach(evaluation => {
      if (evaluation.week_start_date) weeks.add(evaluation.week_start_date)
    })
    return Array.from(weeks).sort().reverse()
  }, [evaluations])

  // Initialize form when editing evaluation changes
  useEffect(() => {
    if (editingEvaluation) {
      setFormData({
        team_id: editingEvaluation.team_id || '',
        week_start_date: editingEvaluation.week_start_date || '',
        rating: editingEvaluation.rating || 3,
        feedback: editingEvaluation.feedback || ''
      })
    } else {
      setFormData({
        team_id: '',
        week_start_date: '',
        rating: 3,
        feedback: ''
      })
    }
  }, [editingEvaluation])

  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showFormModal) {
        handleCancelForm()
      }
    }
    
    if (showFormModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showFormModal])

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      if (selectedTeam && evaluation.team_id !== selectedTeam) return false
      if (selectedWeek && evaluation.week_start_date !== selectedWeek) return false
      return true
    })
  }, [evaluations, selectedTeam, selectedWeek])

  // Calculate average rating for stats
  const averageRating = useMemo(() => {
    if (evaluations.length === 0) return 0
    const total = evaluations.reduce((sum, evalItem) => sum + (evalItem.rating || 0), 0)
    return (total / evaluations.length).toFixed(1)
  }, [evaluations])

  // Use useCallback for stable event handlers
  const handleFormChange = useCallback((e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }))
  }, [])

  const handleRatingChange = useCallback((rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }, [])

  const handleCancelForm = useCallback(() => {
    setShowFormModal(false)
    setEditingEvaluation(null)
    setError('')
    setSuccess('')
  }, [])

  const handleCreate = () => {
    setEditingEvaluation(null)
    setShowFormModal(true)
    setError('')
    setSuccess('')
    setShowSummary(false)
  }

  const handleEdit = useCallback((evaluation) => {
    setEditingEvaluation(evaluation)
    setShowFormModal(true)
    setError('')
    setSuccess('')
    setShowSummary(false)
  }, [])

  const handleGenerateSummary = () => {
    if (selectedWeek) {
      setSummaryWeek(selectedWeek)
      setShowSummary(true)
    } else {
      // Default to most recent week
      if (availableWeeks.length > 0) {
        setSummaryWeek(availableWeeks[0])
        setShowSummary(true)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      // Only include valid database columns
      const validData = {
        team_id: formData.team_id,
        week_start_date: formData.week_start_date,
        rating: formData.rating,
        feedback: formData.feedback || null
      }

      if (editingEvaluation) {
        // Check for duplicate week/team combination
        const { data: existing } = await supabase
          .from('weekly_evaluations')
          .select('id')
          .eq('team_id', validData.team_id)
          .eq('week_start_date', validData.week_start_date)
          .neq('id', editingEvaluation.id)
          .maybeSingle()

        if (existing) {
          throw new Error('An evaluation already exists for this team and week')
        }

        const { error: updateError } = await supabase
          .from('weekly_evaluations')
          .update(validData)
          .eq('id', editingEvaluation.id)

        if (updateError) throw updateError
        setSuccess('Evaluation updated successfully!')
      } else {
        // Check for duplicate week/team combination
        const { data: existing } = await supabase
          .from('weekly_evaluations')
          .select('id')
          .eq('team_id', validData.team_id)
          .eq('week_start_date', validData.week_start_date)
          .maybeSingle()

        if (existing) {
          throw new Error('An evaluation already exists for this team and week')
        }

        const { error: createError } = await supabase
          .from('weekly_evaluations')
          .insert([validData])

        if (createError) throw createError
        setSuccess('Evaluation created successfully!')
      }

      await refetch()
      
      setTimeout(() => {
        setShowFormModal(false)
        setEditingEvaluation(null)
        setSuccess('')
      }, 1000)
    } catch (err) {
      console.error('Error saving evaluation:', err)
      setError(err.message || 'Failed to save evaluation')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteEvaluation) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: deleteError } = await supabase
        .from('weekly_evaluations')
        .delete()
        .eq('id', deleteEvaluation.id)

      if (deleteError) throw deleteError
      
      setSuccess('Evaluation deleted successfully!')
      await refetch()
      setDeleteEvaluation(null)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error deleting evaluation:', err)
      setError(err.message || 'Failed to delete evaluation')
    } finally {
      setFormLoading(false)
    }
  }

  const clearFilters = () => {
    setSelectedTeam('')
    setSelectedWeek('')
  }

  const getTeamName = useCallback((teamId) => {
    const team = teams.find(t => t.id === teamId)
    return team?.name || 'Unknown Team'
  }, [teams])

  const getTeamColor = useCallback((teamId) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return 'bg-gray-500'
    
    // Generate consistent color based on team id
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ]
    const index = teamId.charCodeAt(0) % colors.length
    return colors[index]
  }, [teams])

  const formatWeekDate = useCallback((dateString) => {
    const date = new Date(dateString)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 6)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Weekly Evaluations
              </h1>
              <p className="text-gray-300 text-lg">
                Create and manage weekly team evaluations and performance reviews
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateSummary}
                className="inline-flex items-center px-6 py-3 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-gray-900 transition-all hover:shadow-md"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Generate Summary
              </button>
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="mr-2 h-5 w-5 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Evaluation
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-2xl p-6 shadow-sm border border-emerald-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Evaluations</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : evaluations.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-2xl p-6 shadow-sm border border-yellow-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Average Rating</p>
                  <p className="text-3xl font-bold text-white">{averageRating}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-2xl p-6 shadow-sm border border-blue-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Weeks Covered</p>
                  <p className="text-3xl font-bold text-white">{availableWeeks.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-6 shadow-sm border border-purple-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Teams Evaluated</p>
                  <p className="text-3xl font-bold text-white">
                    {new Set(evaluations.map(e => e.team_id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 animate-slide-down">
            <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 shadow-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">{success}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 animate-slide-down">
            <div className="rounded-xl bg-gradient-to-r from-red-600 to-pink-700 text-white p-4 shadow-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="filter-team" className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Team
              </label>
              <select
                id="filter-team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-week" className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Week
              </label>
              <select
                id="filter-week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              >
                <option value="">All Weeks</option>
                {availableWeeks.map((week) => (
                  <option key={week} value={week}>
                    {formatWeekDate(week)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-6 py-3 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 focus:ring-offset-gray-900 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-400">
            Showing {filteredEvaluations.length} of {evaluations.length} evaluations
            {selectedTeam && ` • Team: ${getTeamName(selectedTeam)}`}
            {selectedWeek && ` • Week: ${formatWeekDate(selectedWeek)}`}
          </div>
        </div>

        {/* Evaluations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading evaluations...</p>
            </div>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border-2 border-dashed border-gray-700 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-emerald-900/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {evaluations.length === 0 ? 'No evaluations yet' : 'No matching evaluations'}
              </h3>
              <p className="text-gray-300 mb-8">
                {evaluations.length === 0 
                  ? 'Start tracking team performance by creating your first weekly evaluation.'
                  : 'Try adjusting your filters to find what you\'re looking for.'}
              </p>
              {evaluations.length === 0 && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Evaluation
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvaluations.map((evaluation) => {
              const team = teams.find(t => t.id === evaluation.team_id)
              const teamColor = getTeamColor(evaluation.team_id)
              
              return (
                <div 
                  key={evaluation.id} 
                  className="group bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-2xl hover:border-emerald-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`${teamColor} w-3 h-3 rounded-full`}></div>
                          <h3 className="text-lg font-semibold text-white">
                            {team?.name || 'Unknown Team'}
                          </h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                            {formatWeekDate(evaluation.week_start_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center">
                            <StarRating rating={evaluation.rating || 0} />
                            <span className="ml-2 text-lg font-bold text-white">
                              {evaluation.rating || 0}/5
                            </span>
                          </div>
                        </div>
                        
                        {evaluation.feedback && (
                          <p className="text-gray-300 whitespace-pre-wrap line-clamp-3 mb-4 leading-relaxed">
                            {evaluation.feedback}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-6">
                          <span className="text-sm text-gray-400">
                            {new Date(evaluation.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(evaluation)}
                              className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors"
                              title="Edit evaluation"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteEvaluation(evaluation)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete evaluation"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Evaluation Form Modal */}
        <EvaluationFormModal
          showFormModal={showFormModal}
          editingEvaluation={editingEvaluation}
          formData={formData}
          formLoading={formLoading}
          error={error}
          teams={teams}
          handleFormChange={handleFormChange}
          handleRatingChange={handleRatingChange}
          handleSubmit={handleSubmit}
          handleCancelForm={handleCancelForm}
        />

        {/* Weekly Summary Modal */}
        <WeeklySummaryModal
          showSummary={showSummary}
          summaryWeek={summaryWeek}
          evaluations={evaluations}
          teams={teams}
          getTeamName={getTeamName}
          getTeamColor={getTeamColor}
          formatWeekDate={formatWeekDate}
          setShowSummary={setShowSummary}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={!!deleteEvaluation}
          onClose={() => setDeleteEvaluation(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Evaluation"
          message="Are you sure you want to delete this evaluation? This action cannot be undone."
          itemName={deleteEvaluation ? `${getTeamName(deleteEvaluation.team_id)} - ${formatWeekDate(deleteEvaluation.week_start_date)}` : ''}
          loading={formLoading}
        />
      </div>
    </div>
  )
}