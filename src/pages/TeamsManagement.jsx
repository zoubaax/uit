import { useState, useEffect, useCallback } from 'react'
import { useTeams } from '../hooks/useTeams'
import { useNotes } from '../hooks/useNotes'
import { useWeeklyEvaluations } from '../hooks/useWeeklyEvaluations'
import { useTeamMembers } from '../hooks/useTeamMembers'
import { supabase } from '../lib/supabase'
import { uploadTeamLogo, deleteTeamLogo } from '../utils/uploadLogo'

// Move TeamFormModal outside the main component
const TeamFormModal = ({ 
  showFormModal, 
  editingTeam, 
  formData, 
  formLoading, 
  error,
  handleFormChange, 
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-2xl shadow-3xl transform transition-all duration-300 animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-700 to-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingTeam ? 'Edit Team' : 'Create New Team'}
                </h2>
                <p className="text-indigo-300 mt-1">
                  {editingTeam ? 'Update team information' : 'Add a new team to your organization'}
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                  placeholder="Enter team name"
                  disabled={formLoading}
                  autoFocus
                  key={`name-${editingTeam?.id || 'new'}`}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                  placeholder="Enter team description"
                  disabled={formLoading}
                  key={`description-${editingTeam?.id || 'new'}`}
                />
              </div>

              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-300 mb-2">
                  Score
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  step="0.01"
                  min="0"
                  max="99999999.99"
                  value={formData.score}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                  placeholder="Enter team score (optional)"
                  disabled={formLoading}
                  key={`score-${editingTeam?.id || 'new'}`}
                />
                <p className="mt-1 text-xs text-gray-400">Optional numeric score for the team (max: 99,999,999.99)</p>
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-2">
                  Team Logo
                </label>
                <div className="space-y-3">
                  {formData.logoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={formData.logoPreview}
                        alt="Logo preview"
                        className="h-24 w-24 object-cover rounded-xl border-2 border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            logo: null,
                            logoPreview: editingTeam?.logo_url || null
                          }))
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={formLoading}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleFormChange}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-900/30 file:text-indigo-300
                      hover:file:bg-indigo-900/50
                      file:cursor-pointer
                      cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={formLoading}
                  />
                  <p className="text-xs text-gray-400">
                    Upload a team logo (max 5MB). Only admins can upload logos.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-6 py-3 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900 transition-all"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
                >
                  {formLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingTeam ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editingTeam ? 'Update Team' : 'Create Team'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Loading Overlay */}
          {formLoading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
                <p className="mt-4 text-gray-300 font-medium">
                  {editingTeam ? 'Updating team...' : 'Creating team...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Move DeleteConfirmationModal outside too
const DeleteConfirmationModal = ({ 
  deleteTeam, 
  formLoading, 
  setDeleteTeam, 
  handleDeleteConfirm 
}) => {
  const isOpen = !!deleteTeam

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setDeleteTeam(null)
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, setDeleteTeam])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 transition-all duration-300 animate-fade-in"
        onClick={() => setDeleteTeam(null)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md overflow-hidden bg-gray-900 rounded-2xl shadow-3xl transform transition-all duration-300 scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-red-700 to-pink-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.584 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Delete Team</h2>
              </div>
              <button
                onClick={() => setDeleteTeam(null)}
                className="p-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={formLoading}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete this team? This action cannot be undone and will permanently delete:
              </p>
              
              {deleteTeam?.name && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl mb-4">
                  <p className="text-red-400 font-medium">{deleteTeam.name}</p>
                </div>
              )}
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-center text-sm text-gray-400">
                  <svg className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  All team information
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <svg className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Associated notes and comments
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <svg className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Weekly evaluations history
                </li>
                <li className="flex items-center text-sm text-gray-400">
                  <svg className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Team member assignments
                </li>
              </ul>
              
              <p className="text-sm text-red-400 font-medium">
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                className="px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:ring-offset-gray-900 transition-all"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={formLoading}
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-pink-800 hover:from-red-600 hover:to-pink-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>

          {/* Loading Overlay */}
          {formLoading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto"></div>
                <p className="mt-4 text-gray-300 font-medium">
                  Deleting team...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function TeamsManagement() {
  const { teams, loading, refetch } = useTeams()
  const [editingTeam, setEditingTeam] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [deleteTeam, setDeleteTeam] = useState(null)
  const [viewingTeam, setViewingTeam] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    score: '',
    logo: null,
    logoPreview: null
  })

  const { notes: teamNotes, loading: notesLoading } = useNotes(viewingTeam?.id)
  const { evaluations: teamEvaluations, loading: evaluationsLoading } = useWeeklyEvaluations(viewingTeam?.id)
  const { members: teamMembers, loading: membersLoading, addMember, removeMember } = useTeamMembers(viewingTeam?.id)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberFormData, setMemberFormData] = useState({ name: '', email: '', role: '' })
  const [memberFormLoading, setMemberFormLoading] = useState(false)
  const [editingScoreTeamId, setEditingScoreTeamId] = useState(null)
  const [scoreInputValue, setScoreInputValue] = useState('')
  const [scoreUpdating, setScoreUpdating] = useState(false)

  // Sort teams by score (descending, nulls last) and assign rankings
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.score !== null && a.score !== undefined && b.score !== null && b.score !== undefined) {
      return b.score - a.score
    }
    if (a.score !== null && a.score !== undefined) return -1
    if (b.score !== null && b.score !== undefined) return 1
    return 0
  })

  const teamsWithRanking = []
  let currentRank = 1
  sortedTeams.forEach((team, index) => {
    let rank = null
    if (team.score !== null && team.score !== undefined) {
      if (index > 0 && 
          sortedTeams[index - 1].score !== null &&
          sortedTeams[index - 1].score !== undefined &&
          team.score === sortedTeams[index - 1].score) {
        rank = teamsWithRanking[index - 1].rank
      } else {
        rank = currentRank
        currentRank++
      }
    }
    teamsWithRanking.push({ ...team, rank })
  })

  // Use useCallback for stable event handlers
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'file' && files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }, [])

  const handleCancelForm = useCallback(() => {
    setShowFormModal(false)
    setEditingTeam(null)
    setError('')
    setSuccess('')
  }, [])

  // Initialize form when editing team changes
  useEffect(() => {
    if (editingTeam) {
      setFormData({
        name: editingTeam.name || '',
        description: editingTeam.description || '',
        score: editingTeam.score !== null && editingTeam.score !== undefined ? editingTeam.score.toString() : '',
        logo: null,
        logoPreview: editingTeam.logo_url || null
      })
    } else {
      setFormData({
        name: '',
        description: '',
        score: '',
        logo: null,
        logoPreview: null
      })
    }
  }, [editingTeam])

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
  }, [showFormModal, handleCancelForm])

  const handleCreate = () => {
    setEditingTeam(null)
    setShowFormModal(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = (team) => {
    setEditingTeam(team)
    setShowFormModal(true)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      let logoUrl = editingTeam?.logo_url || null

      // Upload logo if a new one was selected
      if (formData.logo) {
        // Use existing team ID or generate a temporary UUID for file naming
        const teamId = editingTeam?.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const uploadResult = await uploadTeamLogo(formData.logo, teamId)
        
        if (uploadResult.error) {
          throw new Error(uploadResult.error)
        }

        // Delete old logo if updating
        if (editingTeam?.logo_url && editingTeam.logo_url !== uploadResult.url) {
          await deleteTeamLogo(editingTeam.logo_url)
        }

        logoUrl = uploadResult.url
      }

      // Validate score if provided
      let scoreValue = null
      if (formData.score) {
        const parsedScore = parseFloat(formData.score)
        const MAX_SCORE = 99999999.99
        if (isNaN(parsedScore)) {
          throw new Error('Invalid score value')
        }
        if (parsedScore < 0) {
          throw new Error('Score cannot be negative')
        }
        if (parsedScore > MAX_SCORE) {
          throw new Error(`Score cannot exceed ${MAX_SCORE.toLocaleString()}`)
        }
        scoreValue = parsedScore
      }

      const validData = {
        name: formData.name,
        description: formData.description || null,
        score: scoreValue,
        logo_url: logoUrl
      }

      if (editingTeam) {
        const { error: updateError } = await supabase
          .from('teams')
          .update(validData)
          .eq('id', editingTeam.id)

        if (updateError) throw updateError
        setSuccess('Team updated successfully!')
      } else {
        const { error: createError } = await supabase
          .from('teams')
          .insert([validData])

        if (createError) throw createError
        setSuccess('Team created successfully!')
      }

      await refetch()
      
      setTimeout(() => {
        setShowFormModal(false)
        setEditingTeam(null)
        setFormData({
          name: '',
          description: '',
          score: '',
          logo: null,
          logoPreview: null
        })
        setSuccess('')
      }, 1500)
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
      await refetch()
      setDeleteTeam(null)
      
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error deleting team:', err)
      setError(err.message || 'Failed to delete team')
    } finally {
      setFormLoading(false)
    }
  }

  const handleQuickScoreEdit = (team) => {
    setEditingScoreTeamId(team.id)
    setScoreInputValue('') // Start with empty input for adding to score
  }

  const handleQuickScoreCancel = () => {
    setEditingScoreTeamId(null)
    setScoreInputValue('')
  }

  const handleQuickScoreUpdate = async (teamId) => {
    setScoreUpdating(true)
    setError('')
    setSuccess('')

    try {
      // Get current team to access existing score
      const currentTeam = teams.find(t => t.id === teamId)
      const currentScore = currentTeam?.score !== null && currentTeam?.score !== undefined ? parseFloat(currentTeam.score) : 0
      
      const addValue = scoreInputValue.trim() === '' ? 0 : parseFloat(scoreInputValue)
      
      if (scoreInputValue.trim() !== '' && (isNaN(addValue))) {
        setError('Please enter a valid number')
        setScoreUpdating(false)
        return
      }

      // Calculate new score by adding to existing
      const newScore = currentScore + addValue

      // Validate score doesn't exceed maximum (99,999,999.99)
      const MAX_SCORE = 99999999.99
      if (newScore > MAX_SCORE) {
        setError(`Score cannot exceed ${MAX_SCORE.toLocaleString()}`)
        setScoreUpdating(false)
        return
      }

      if (newScore < 0) {
        setError('Score cannot be negative')
        setScoreUpdating(false)
        return
      }

      const { error: updateError } = await supabase
        .from('teams')
        .update({ score: newScore })
        .eq('id', teamId)

      if (updateError) throw updateError
      
      setSuccess(`Score updated! Added ${addValue >= 0 ? '+' : ''}${Math.round(addValue)}. New score: ${Math.round(newScore)}`)
      await refetch()
      
      // Update viewingTeam if it's currently being viewed
      if (viewingTeam && viewingTeam.id === teamId) {
        const { data: updatedTeam } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single()
        if (updatedTeam) {
          setViewingTeam(updatedTeam)
        }
      }
      
      setEditingScoreTeamId(null)
      setScoreInputValue('')
      
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error updating score:', err)
      setError(err.message || 'Failed to update score')
    } finally {
      setScoreUpdating(false)
    }
  }

  if (viewingTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button and Header */}
          <div className="mb-8">
            <button
              onClick={handleCloseView}
              className="group inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors mb-6"
            >
              <svg className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Teams
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {viewingTeam.logo_url ? (
                    <img
                      src={viewingTeam.logo_url}
                      alt={`${viewingTeam.name} logo`}
                      className="h-16 w-16 object-cover rounded-2xl shadow-lg border-2 border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg ${viewingTeam.logo_url ? 'hidden' : ''}`}>
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">{viewingTeam.name}</h1>
                    {viewingTeam.description && (
                      <p className="mt-2 text-gray-300 text-lg leading-relaxed max-w-3xl">
                        {viewingTeam.description}
                      </p>
                    )}
                    {editingScoreTeamId === viewingTeam.id ? (
                      <div className="mt-3">
                        <div className="mb-2 text-sm text-gray-400">
                          Current score: <span className="font-semibold">{viewingTeam.score !== null && viewingTeam.score !== undefined ? Math.round(parseFloat(viewingTeam.score)) : '0'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              step="0.01"
                              value={scoreInputValue}
                              onChange={(e) => setScoreInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleQuickScoreUpdate(viewingTeam.id)
                                } else if (e.key === 'Escape') {
                                  handleQuickScoreCancel()
                                }
                              }}
                              className="w-full px-4 py-2 text-base bg-gray-800 border border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-white"
                              placeholder="Enter amount to add (e.g., +5.5 or -2.0)"
                              autoFocus
                              disabled={scoreUpdating}
                            />
                            <p className="mt-1 text-xs text-gray-400">Enter positive number to add, negative to subtract</p>
                          </div>
                          <button
                            onClick={() => handleQuickScoreUpdate(viewingTeam.id)}
                            disabled={scoreUpdating}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save score"
                          >
                            {scoreUpdating ? (
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            onClick={handleQuickScoreCancel}
                            disabled={scoreUpdating}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="inline-flex items-center gap-2">
                          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800">
                            <svg className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span className="text-base font-bold text-amber-300">
                              Score: {viewingTeam.score !== null && viewingTeam.score !== undefined ? Math.round(parseFloat(viewingTeam.score)) : 'Not set'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleQuickScoreEdit(viewingTeam)}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-colors"
                            title="Add to score"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                    <svg className="mr-1.5 h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created {new Date(viewingTeam.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleEdit(viewingTeam)}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900 transition-all hover:shadow-md"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Team
                </button>
                <button
                  onClick={() => setDeleteTeam(viewingTeam)}
                  className="inline-flex items-center px-4 py-2.5 border border-red-800 rounded-xl shadow-sm text-sm font-medium text-red-400 bg-gray-800 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 focus:ring-offset-gray-900 transition-all hover:shadow-md"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="mb-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-cyan-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Team Members</h2>
                  <p className="text-blue-200 mt-1">Manage team members</p>
                </div>
                <button
                  onClick={() => setShowMemberForm(true)}
                  className="px-4 py-2 bg-black/20 hover:bg-black/30 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  + Add Member
                </button>
              </div>
            </div>
            <div className="p-6">
              {showMemberForm && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Add Team Member</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={memberFormData.name}
                        onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
                        placeholder="Member name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={memberFormData.email}
                        onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
                        placeholder="member@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={memberFormData.role}
                        onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
                        placeholder="e.g., Developer, Designer"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!memberFormData.name.trim()) return
                          setMemberFormLoading(true)
                          const result = await addMember({
                            name: memberFormData.name.trim(),
                            email: memberFormData.email.trim() || null,
                            role: memberFormData.role.trim() || null
                          })
                          if (!result.error) {
                            setMemberFormData({ name: '', email: '', role: '' })
                            setShowMemberForm(false)
                          }
                          setMemberFormLoading(false)
                        }}
                        disabled={memberFormLoading || !memberFormData.name.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowMemberForm(false)
                          setMemberFormData({ name: '', email: '', role: '' })
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {membersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-4 text-sm font-medium text-gray-100">No members yet</h3>
                  <p className="mt-1 text-sm text-gray-400">Add team members to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-blue-600 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{member.name}</h4>
                          {member.role && (
                            <p className="text-sm text-gray-400 mt-1">{member.role}</p>
                          )}
                          {member.email && (
                            <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${member.name} from the team?`)) {
                              await removeMember(member.id)
                            }
                          }}
                          className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes and Evaluations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notes Section */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all hover:shadow-3xl">
              <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-purple-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Team Notes</h2>
                  <span className="px-3 py-1 rounded-full bg-black/20 text-white text-sm font-medium">
                    {notesLoading ? '...' : teamNotes.length}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {notesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                  </div>
                ) : teamNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-100">No notes yet</h3>
                    <p className="mt-1 text-sm text-gray-400">Add some notes to track important information</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {teamNotes.map((note, index) => (
                      <div 
                        key={note.id} 
                        className={`p-5 rounded-xl border-l-4 ${
                          index % 3 === 0 
                            ? 'border-l-blue-400 bg-blue-900/20' 
                            : index % 3 === 1 
                            ? 'border-l-green-400 bg-green-900/20' 
                            : 'border-l-purple-400 bg-purple-900/20'
                        }`}
                      >
                        {note.category && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 mb-3 shadow-sm">
                            {note.category}
                          </span>
                        )}
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                          <span>
                            {new Date(note.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {note.created_by && (
                            <span className="inline-flex items-center">
                              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              By Admin
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Evaluations Section */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transition-all hover:shadow-3xl">
              <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 to-teal-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Weekly Evaluations</h2>
                  <span className="px-3 py-1 rounded-full bg-black/20 text-white text-sm font-medium">
                    {evaluationsLoading ? '...' : teamEvaluations.length}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {evaluationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  </div>
                ) : teamEvaluations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-100">No evaluations yet</h3>
                    <p className="mt-1 text-sm text-gray-400">Weekly evaluations will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {teamEvaluations.map((evaluation) => (
                      <div key={evaluation.id} className="p-5 rounded-xl border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 hover:border-emerald-800 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">
                              Week of {new Date(evaluation.week_start_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(evaluation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {evaluation.rating && (
                            <div className="flex items-center">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-5 w-5 ${i < evaluation.rating ? 'text-yellow-500' : 'text-gray-600'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="ml-2 text-sm font-medium text-white">
                                {evaluation.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                        {evaluation.feedback && (
                          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{evaluation.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Form Modal */}
          <TeamFormModal
            showFormModal={showFormModal}
            editingTeam={editingTeam}
            formData={formData}
            formLoading={formLoading}
            error={error}
            handleFormChange={handleFormChange}
            handleSubmit={handleSubmit}
            handleCancelForm={handleCancelForm}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            deleteTeam={deleteTeam}
            formLoading={formLoading}
            setDeleteTeam={setDeleteTeam}
            handleDeleteConfirm={handleDeleteConfirm}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Teams Management
              </h1>
              <p className="text-gray-300 text-lg">
                Create, edit, and manage your organization's teams
              </p>
            </div>
            
            <button
              onClick={handleCreate}
              className="group inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Team
            </button>
          </div>

          {/* Top Teams Banner */}
          {(() => {
            const topTeams = teamsWithRanking.filter(t => t.score !== null && t.score !== undefined).slice(0, 3)
            if (topTeams.length === 0) return null
            
            return (
              <div className="mb-8 bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20 rounded-2xl border-2 border-amber-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-amber-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Top Teams Leaderboard</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topTeams.map((team) => (
                    <div key={team.id} className="bg-gray-800 rounded-xl p-4 border border-amber-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          team.rank === 1 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                            : team.rank === 2
                            ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                            : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                        }`}>
                          {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : '🥉'}
                        </div>
                        <span className="text-lg font-bold text-amber-400">
                          {Math.round(parseFloat(team.score))}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white truncate">{team.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 rounded-2xl p-6 shadow-sm border border-indigo-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : teams.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-2xl p-6 shadow-sm border border-emerald-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Notes</p>
                  <p className="text-3xl font-bold text-white">
                    {teams.reduce((acc, team) => acc + (team._count?.notes || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-2xl p-6 shadow-sm border border-amber-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Evaluations</p>
                  <p className="text-3xl font-bold text-white">
                    {teams.reduce((acc, team) => acc + (team._count?.evaluations || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-6 shadow-sm border border-purple-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Teams</p>
                  <p className="text-3xl font-bold text-white">{teams.length}</p>
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

        {/* Teams List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading teams...</p>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border-2 border-dashed border-gray-700 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-indigo-900/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No teams yet</h3>
              <p className="text-gray-300 mb-8">
                Start building your organization by creating your first team.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Team
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsWithRanking.map((team) => (
              <div 
                key={team.id} 
                className="group bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-3xl hover:border-indigo-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {team.score !== null && team.score !== undefined && (
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            team.rank === 1 
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                              : team.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                              : team.rank === 3
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600 from-indigo-600 to-purple-700 text-white'
                          }`}>
                            {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : `#${team.rank}`}
                          </div>
                        )}
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className="h-12 w-12 object-cover rounded-xl shadow-sm border-2 border-gray-700 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`p-2 bg-gradient-to-br from-indigo-500 to-purple-600 from-indigo-600 to-purple-700 rounded-xl shadow-sm flex-shrink-0 ${team.logo_url ? 'hidden' : ''}`}>
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {team.name}
                          </h3>
                        </div>
                      </div>
                      
                      {team.description && (
                        <p className="text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                          {team.description}
                        </p>
                      )}
                      
                      {editingScoreTeamId === team.id ? (
                        <div className="mb-4">
                          <div className="mb-2 text-xs text-gray-400">
                            Current: <span className="font-semibold">{team.score !== null && team.score !== undefined ? Math.round(parseFloat(team.score)) : '0'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                step="0.01"
                                value={scoreInputValue}
                                onChange={(e) => setScoreInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleQuickScoreUpdate(team.id)
                                  } else if (e.key === 'Escape') {
                                    handleQuickScoreCancel()
                                  }
                                }}
                                className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-white"
                                placeholder="Add/subtract (e.g., +5 or -2)"
                                autoFocus
                                disabled={scoreUpdating}
                              />
                            </div>
                            <button
                              onClick={() => handleQuickScoreUpdate(team.id)}
                              disabled={scoreUpdating}
                              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Save score"
                            >
                              {scoreUpdating ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={handleQuickScoreCancel}
                              disabled={scoreUpdating}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Cancel"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2">
                            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-800">
                              <svg className="h-4 w-4 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span className="text-sm font-semibold text-amber-300">
                                Score: {team.score !== null && team.score !== undefined ? Math.round(parseFloat(team.score)) : 'Not set'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleQuickScoreEdit(team)}
                              className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-lg transition-colors"
                              title="Add to score"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(team.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700 mt-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleView(team)}
                        className="group/view inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                      >
                        View Details
                        <svg className="ml-1.5 h-4 w-4 transform group-hover/view:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(team)}
                          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Edit team"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTeam(team)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete team"
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
            ))}
          </div>
        )}

        {/* Team Form Modal */}
        <TeamFormModal
          showFormModal={showFormModal}
          editingTeam={editingTeam}
          formData={formData}
          formLoading={formLoading}
          error={error}
          handleFormChange={handleFormChange}
          handleSubmit={handleSubmit}
          handleCancelForm={handleCancelForm}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          deleteTeam={deleteTeam}
          formLoading={formLoading}
          setDeleteTeam={setDeleteTeam}
          handleDeleteConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  )
}