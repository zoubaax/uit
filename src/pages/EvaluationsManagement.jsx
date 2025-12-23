import { useState, useMemo } from 'react'
import { useAllEvaluations } from '../hooks/useAllEvaluations'
import { useTeams } from '../hooks/useTeams'
import { supabase } from '../lib/supabase'
import EvaluationForm from '../components/EvaluationForm'
import WeeklySummary from '../components/WeeklySummary'
import StarRating from '../components/StarRating'
import DeleteConfirmation from '../components/DeleteConfirmation'

export default function EvaluationsManagement() {
  const { evaluations, loading, refetch } = useAllEvaluations()
  const { teams } = useTeams()
  
  const [editingEvaluation, setEditingEvaluation] = useState(null)
  const [showForm, setShowForm] = useState(false)
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

  // Get unique weeks from evaluations
  const availableWeeks = useMemo(() => {
    const weeks = new Set()
    evaluations.forEach(evaluation => {
      if (evaluation.week_start_date) weeks.add(evaluation.week_start_date)
    })
    return Array.from(weeks).sort().reverse()
  }, [evaluations])

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      if (selectedTeam && evaluation.team_id !== selectedTeam) return false
      if (selectedWeek && evaluation.week_start_date !== selectedWeek) return false
      return true
    })
  }, [evaluations, selectedTeam, selectedWeek])

  const handleCreate = () => {
    setEditingEvaluation(null)
    setShowForm(true)
    setError('')
    setSuccess('')
    setShowSummary(false)
  }

  const handleEdit = (evaluation) => {
    setEditingEvaluation(evaluation)
    setShowForm(true)
    setError('')
    setSuccess('')
    setShowSummary(false)
  }

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

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingEvaluation) {
        // Check for duplicate week/team combination
        const { data: existing } = await supabase
          .from('weekly_evaluations')
          .select('id')
          .eq('team_id', formData.team_id)
          .eq('week_start_date', formData.week_start_date)
          .neq('id', editingEvaluation.id)
          .maybeSingle()

        if (existing) {
          throw new Error('An evaluation already exists for this team and week')
        }

        const { error: updateError } = await supabase
          .from('weekly_evaluations')
          .update(formData)
          .eq('id', editingEvaluation.id)

        if (updateError) throw updateError
        setSuccess('Evaluation updated successfully!')
      } else {
        // Check for duplicate week/team combination
        const { data: existing } = await supabase
          .from('weekly_evaluations')
          .select('id')
          .eq('team_id', formData.team_id)
          .eq('week_start_date', formData.week_start_date)
          .maybeSingle()

        if (existing) {
          throw new Error('An evaluation already exists for this team and week')
        }

        const { error: createError } = await supabase
          .from('weekly_evaluations')
          .insert([formData])

        if (createError) throw createError
        setSuccess('Evaluation created successfully!')
      }

      await refetch()
      
      setTimeout(() => {
        setShowForm(false)
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

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingEvaluation(null)
    setError('')
    setSuccess('')
  }

  const clearFilters = () => {
    setSelectedTeam('')
    setSelectedWeek('')
  }

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId)
    return team?.name || 'Unknown Team'
  }

  const formatWeekDate = (dateString) => {
    const date = new Date(dateString)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 6)
    return `${date.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Evaluations</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage weekly team evaluations
          </p>
        </div>
        {!showForm && (
          <div className="flex space-x-2">
            <button
              onClick={handleGenerateSummary}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Summary
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Evaluation
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingEvaluation ? 'Edit Evaluation' : 'Create New Evaluation'}
          </h2>
          <EvaluationForm
            evaluation={editingEvaluation}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      )}

      {/* Weekly Summary */}
      {showSummary && !showForm && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900">Weekly Summary</h2>
            <button
              onClick={() => setShowSummary(false)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              Close Summary
            </button>
          </div>
          <WeeklySummary evaluations={evaluations} weekStartDate={summaryWeek} />
        </div>
      )}

      {/* Filters */}
      {!showForm && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filter-team" className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Team
              </label>
              <select
                id="filter-team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              <label htmlFor="filter-week" className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Week
              </label>
              <select
                id="filter-week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredEvaluations.length} of {evaluations.length} evaluations
          </div>
        </div>
      )}

      {/* Evaluations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading evaluations...</div>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations</h3>
          <p className="mt-1 text-sm text-gray-500">
            {evaluations.length === 0
              ? 'Get started by creating a new evaluation.'
              : 'No evaluations match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredEvaluations.map((evaluation) => {
              const team = evaluation.teams
              
              return (
                <li key={evaluation.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium text-indigo-600">
                            {team?.name || 'Unknown Team'}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatWeekDate(evaluation.week_start_date)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <StarRating rating={evaluation.rating || 0} editable={false} />
                        </div>
                        {evaluation.feedback && (
                          <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                            {evaluation.feedback}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Created {new Date(evaluation.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleEdit(evaluation)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteEvaluation(evaluation)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={!!deleteEvaluation}
        onClose={() => setDeleteEvaluation(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Evaluation"
        message="Are you sure you want to delete this evaluation?"
        itemName={deleteEvaluation ? `${getTeamName(deleteEvaluation.team_id)} - ${formatWeekDate(deleteEvaluation.week_start_date)}` : ''}
      />
    </div>
  )
}

