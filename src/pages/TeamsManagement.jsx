import { useState } from 'react'
import { useTeams } from '../hooks/useTeams'
import { useNotes } from '../hooks/useNotes'
import { useWeeklyEvaluations } from '../hooks/useWeeklyEvaluations'
import { supabase } from '../lib/supabase'
import TeamForm from '../components/TeamForm'
import DeleteConfirmation from '../components/DeleteConfirmation'

export default function TeamsManagement() {
  const { teams, loading, refetch } = useTeams()
  const [editingTeam, setEditingTeam] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTeam, setDeleteTeam] = useState(null)
  const [viewingTeam, setViewingTeam] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { notes: teamNotes, loading: notesLoading } = useNotes(viewingTeam?.id)
  const { evaluations: teamEvaluations, loading: evaluationsLoading } = useWeeklyEvaluations(viewingTeam?.id)

  const handleCreate = () => {
    setEditingTeam(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = (team) => {
    setEditingTeam(team)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleView = (team) => {
    setViewingTeam(team)
    setError('')
    setSuccess('')
  }

  const handleCloseView = () => {
    setViewingTeam(null)
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingTeam) {
        // Update existing team
        const { error: updateError } = await supabase
          .from('teams')
          .update(formData)
          .eq('id', editingTeam.id)

        if (updateError) throw updateError
        setSuccess('Team updated successfully!')
      } else {
        // Create new team
        const { error: createError } = await supabase
          .from('teams')
          .insert([formData])

        if (createError) throw createError
        setSuccess('Team created successfully!')
      }

      // Refresh teams list
      await refetch()
      
      // Close form after a short delay
      setTimeout(() => {
        setShowForm(false)
        setEditingTeam(null)
        setSuccess('')
      }, 1000)
    } catch (err) {
      console.error('Error saving team:', err)
      setError(err.message || 'Failed to save team')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTeam) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', deleteTeam.id)

      if (deleteError) throw deleteError
      
      setSuccess('Team deleted successfully!')
      
      // Refresh teams list
      await refetch()
      
      // Close dialog
      setDeleteTeam(null)
      
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error deleting team:', err)
      setError(err.message || 'Failed to delete team')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTeam(null)
    setError('')
    setSuccess('')
  }

  if (viewingTeam) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <button
            onClick={handleCloseView}
            className="text-sm text-indigo-600 hover:text-indigo-900 mb-4"
          >
            ← Back to Teams
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{viewingTeam.name}</h1>
          {viewingTeam.description && (
            <p className="mt-2 text-gray-600">{viewingTeam.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            {notesLoading ? (
              <div className="text-gray-600">Loading notes...</div>
            ) : teamNotes.length === 0 ? (
              <p className="text-gray-500">No notes yet.</p>
            ) : (
              <div className="space-y-4">
                {teamNotes.map((note) => (
                  <div key={note.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    {note.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                        {note.category}
                      </span>
                    )}
                    <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleString()}
                      {note.created_by && ' • By Admin'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evaluations Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Evaluations</h2>
            {evaluationsLoading ? (
              <div className="text-gray-600">Loading evaluations...</div>
            ) : teamEvaluations.length === 0 ? (
              <p className="text-gray-500">No evaluations yet.</p>
            ) : (
              <div className="space-y-4">
                {teamEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Week of {new Date(evaluation.week_start_date).toLocaleDateString()}
                      </span>
                      {evaluation.rating && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Rating: {evaluation.rating}/5
                        </span>
                      )}
                    </div>
                    {evaluation.feedback && (
                      <p className="text-gray-700 whitespace-pre-wrap">{evaluation.feedback}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(evaluation.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create, edit, and manage teams
          </p>
        </div>
        {!showForm && (
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
            Create Team
          </button>
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
            {editingTeam ? 'Edit Team' : 'Create New Team'}
          </h2>
          <TeamForm
            team={editingTeam}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      )}

      {/* Teams List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading teams...</div>
        </div>
      ) : teams.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new team.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {teams.map((team) => (
              <li key={team.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {team.name}
                        </p>
                      </div>
                      {team.description && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleView(team)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(team)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTeam(team)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={!!deleteTeam}
        onClose={() => setDeleteTeam(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team"
        message="Are you sure you want to delete this team? This will also delete all associated notes and evaluations."
        itemName={deleteTeam?.name}
      />
    </div>
  )
}

