import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAllNotes } from '../hooks/useAllNotes'
import { useTeams } from '../hooks/useTeams'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import DeleteConfirmation from '../components/DeleteConfirmation'

// Move NoteFormModal outside the main component
const NoteFormModal = ({ 
  showFormModal, 
  editingNote, 
  formData, 
  formLoading, 
  error,
  success,
  teams,
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
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                <p className="text-indigo-300 mt-1">
                  {editingNote ? 'Update your note' : 'Add a new note for any team'}
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

          {/* Success Message */}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-900/20 border border-green-800 rounded-xl">
              <div className="flex items-center text-green-400">
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!editingNote && (
                <div>
                  <label htmlFor="team_id" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Team *
                  </label>
                  <select
                    id="team_id"
                    name="team_id"
                    required
                    value={formData.team_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                    disabled={formLoading}
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                  placeholder="General, Feedback, Task, etc."
                  disabled={formLoading}
                  key={`category-${editingNote?.id || 'new'}`}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                  Note Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={6}
                  value={formData.content}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                  placeholder="Write your note here..."
                  disabled={formLoading}
                  autoFocus
                  key={`content-${editingNote?.id || 'new'}`}
                />
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
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
                >
                  {formLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingNote ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editingNote ? 'Update Note' : 'Create Note'
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
                  {editingNote ? 'Updating note...' : 'Creating note...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Move NotePreviewModal outside the main component
const NotePreviewModal = ({ 
  previewNote, 
  handleClosePreview, 
  handleEdit 
}) => {
  if (!previewNote) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 transition-all duration-300 animate-fade-in"
        onClick={handleClosePreview}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-gray-900 rounded-2xl shadow-3xl transform transition-all duration-300 animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 from-indigo-700 to-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Note Preview</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    {previewNote.teamName}
                  </span>
                  {previewNote.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white">
                      {previewNote.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleClosePreview}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Note Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-lg">
                {previewNote.content}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(previewNote.created_at).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {previewNote.created_by ? 'By Admin' : 'Anonymous'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    handleClosePreview()
                    handleEdit(previewNote)
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  Edit Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function NotesManagement() {
  const { notes, loading, refetch } = useAllNotes()
  const { teams } = useTeams()
  const { user } = useAuth()
  
  const [editingNote, setEditingNote] = useState(null)
  const [previewNote, setPreviewNote] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [deleteNote, setDeleteNote] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filter states
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  // Bulk selection
  const [selectedNotes, setSelectedNotes] = useState(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  // Separate loading state for delete operations
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    content: '',
    category: '',
    team_id: '',
    created_by: null
  })

  // Get unique categories from notes
  const categories = useMemo(() => {
    const cats = new Set()
    notes.forEach(note => {
      if (note.category) cats.add(note.category)
    })
    return Array.from(cats).sort()
  }, [notes])

  // Initialize form when editing note changes
  useEffect(() => {
    if (editingNote) {
      setFormData({
        content: editingNote.content || '',
        category: editingNote.category || '',
        team_id: editingNote.team_id || '',
        created_by: editingNote.created_by
      })
    } else {
      setFormData({
        content: '',
        category: '',
        team_id: '',
        created_by: user?.id || null
      })
    }
  }, [editingNote, user?.id])

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

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (selectedTeam && note.team_id !== selectedTeam) return false
      if (selectedCategory && note.category !== selectedCategory) return false
      if (dateFilter) {
        const noteDate = new Date(note.created_at).toDateString()
        const filterDate = new Date(dateFilter).toDateString()
        if (noteDate !== filterDate) return false
      }
      return true
    })
  }, [notes, selectedTeam, selectedCategory, dateFilter])

  // Use useCallback for stable event handlers
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleCancelForm = useCallback(() => {
    setShowFormModal(false)
    setEditingNote(null)
    setPreviewNote(null)
    setError('')
    setSuccess('')
  }, [])

  const handleCreate = () => {
    setEditingNote(null)
    setPreviewNote(null)
    setShowFormModal(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = useCallback((note) => {
    setEditingNote(note)
    setPreviewNote(null)
    setShowFormModal(true)
    setError('')
    setSuccess('')
  }, [])

  const handlePreview = useCallback((note) => {
    const team = teams.find(t => t.id === note.team_id)
    setPreviewNote({ 
      ...note, 
      teamName: team?.name,
      teamColor: getTeamColor(note.team_id)
    })
  }, [teams])

  const handleClosePreview = useCallback(() => {
    setPreviewNote(null)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingNote) {
        // When editing, preserve team_id and created_by
        const updateData = {
          content: formData.content,
          category: formData.category,
          team_id: editingNote.team_id,
          created_by: editingNote.created_by,
        }
        
        const { error: updateError } = await supabase
          .from('notes')
          .update(updateData)
          .eq('id', editingNote.id)

        if (updateError) throw updateError
        setSuccess('Note updated successfully!')
      } else {
        const { error: createError } = await supabase
          .from('notes')
          .insert([formData])

        if (createError) throw createError
        setSuccess('Note created successfully!')
      }

      await refetch()
      
      setTimeout(() => {
        setShowFormModal(false)
        setEditingNote(null)
        setPreviewNote(null)
        setSuccess('')
      }, 1000)
    } catch (err) {
      console.error('Error saving note:', err)
      setError(err.message || 'Failed to save note')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteNote) {
      console.error('No note selected for deletion')
      return
    }

    const noteId = deleteNote.id
    console.log('Delete confirmed for note:', noteId)
    
    setDeleteLoading(true)
    setError('')

    try {
      const { error: deleteError, data } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .select() // Add select to check what was deleted

      console.log('Delete response:', { deleteError, data })

      if (deleteError) {
        console.error('Delete error details:', deleteError)
        throw new Error(deleteError.message || 'Failed to delete note')
      }
      
      // Success - close modal and refresh
      setSuccess('Note deleted successfully!')
      await refetch()
      
      // Clear delete note state and error
      setDeleteNote(null)
      setError('')
      
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err.message || 'Failed to delete note. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotes.size === 0) return

    setDeleteLoading(true)
    setError('')
    setSuccess('')

    try {
      const noteIds = Array.from(selectedNotes)
      console.log('Bulk deleting note IDs:', noteIds)
      
      const { error: deleteError, data } = await supabase
        .from('notes')
        .delete()
        .in('id', noteIds)
        .select()

      console.log('Bulk delete response:', { deleteError, data })

      if (deleteError) {
        console.error('Bulk delete error details:', deleteError)
        throw new Error(deleteError.message || 'Failed to delete notes')
      }
      
      setSuccess(`${noteIds.length} note(s) deleted successfully!`)
      setSelectedNotes(new Set())
      setBulkDeleteOpen(false)
      setError('')
      
      await refetch()
    } catch (err) {
      console.error('Error deleting notes:', err)
      setError(err.message || 'Failed to delete notes. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleNoteSelection = (noteId) => {
    const newSelected = new Set(selectedNotes)
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId)
    } else {
      newSelected.add(noteId)
    }
    setSelectedNotes(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedNotes.size === filteredNotes.length) {
      setSelectedNotes(new Set())
    } else {
      setSelectedNotes(new Set(filteredNotes.map(n => n.id)))
    }
  }

  const clearFilters = () => {
    setSelectedTeam('')
    setSelectedCategory('')
    setDateFilter('')
  }

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId)
    return team?.name || 'Unknown Team'
  }

  const getTeamColor = (teamId) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return 'bg-gray-500'
    
    // Generate consistent color based on team id
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ]
    const index = teamId.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Handle close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteNote(null)
    setError('')
  }

  // Handle close bulk delete modal
  const handleCloseBulkDeleteModal = () => {
    setBulkDeleteOpen(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Notes Management
              </h1>
              <p className="text-gray-300 text-lg">
                Create, edit, and manage notes for all teams
              </p>
            </div>
            
            <button
              onClick={handleCreate}
              className="group inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Note
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 rounded-2xl p-6 shadow-sm border border-indigo-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Notes</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : notes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 rounded-2xl p-6 shadow-sm border border-emerald-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Teams with Notes</p>
                  <p className="text-3xl font-bold text-white">
                    {new Set(notes.map(n => n.team_id)).size}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-2xl p-6 shadow-sm border border-amber-800/30">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-xl shadow-sm mr-4">
                  <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Categories</p>
                  <p className="text-3xl font-bold text-white">{categories.length}</p>
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
                  <p className="text-sm font-medium text-gray-400">Today's Notes</p>
                  <p className="text-3xl font-bold text-white">
                    {notes.filter(n => {
                      const noteDate = new Date(n.created_at).toDateString()
                      const today = new Date().toDateString()
                      return noteDate === today
                    }).length}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="filter-team" className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Team
              </label>
              <select
                id="filter-team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
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
              <label htmlFor="filter-category" className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Category
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-date" className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                id="filter-date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-6 py-3 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-gray-900 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {filteredNotes.length} of {notes.length} notes
              {selectedTeam && ` • Team: ${getTeamName(selectedTeam)}`}
              {selectedCategory && ` • Category: ${selectedCategory}`}
            </div>
            {selectedNotes.size > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-indigo-400">
                  {selectedNotes.size} selected
                </span>
                <button
                  onClick={() => setSelectedNotes(new Set())}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Clear
                </button>
                <button
                  onClick={() => setBulkDeleteOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-red-400 bg-red-900/20 border border-red-800 rounded-lg hover:bg-red-900/30 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-2xl border-2 border-dashed border-gray-700 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-indigo-900/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
              </h3>
              <p className="text-gray-300 mb-8">
                {notes.length === 0 
                  ? 'Start documenting important information by creating your first note.'
                  : 'Try adjusting your filters to find what you\'re looking for.'}
              </p>
              {notes.length === 0 && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Note
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
              <label className="flex items-center cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedNotes.size === filteredNotes.length && filteredNotes.length > 0}
                    onChange={toggleSelectAll}
                    className="sr-only"
                  />
                  <div className={`block w-5 h-5 border-2 rounded transition-all ${
                    selectedNotes.size === filteredNotes.length && filteredNotes.length > 0
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-600'
                  }`}>
                    {selectedNotes.size === filteredNotes.length && filteredNotes.length > 0 && (
                      <svg className="w-4 h-4 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  Select All ({filteredNotes.length} notes)
                </span>
              </label>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredNotes.map((note) => {
                const isSelected = selectedNotes.has(note.id)
                const team = teams.find(t => t.id === note.team_id)
                const teamColor = getTeamColor(note.team_id)
                
                return (
                  <div 
                    key={note.id} 
                    className={`group bg-gray-800 rounded-2xl shadow-xl border-2 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-900/10' 
                        : 'border-gray-700 hover:border-indigo-600'
                    } overflow-hidden transition-all duration-300 hover:shadow-2xl`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`${teamColor} w-3 h-3 rounded-full`}></div>
                            <h3 className="text-lg font-semibold text-white">
                              {team?.name || 'Unknown Team'}
                            </h3>
                            {note.category && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                                {note.category}
                              </span>
                            )}
                            {note.created_by ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300">
                                Anonymous
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-300 whitespace-pre-wrap line-clamp-3 mb-4 leading-relaxed">
                            {note.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              {new Date(note.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <label className="flex items-center cursor-pointer select-none">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleNoteSelection(note.id)}
                                className="sr-only"
                              />
                              <div className={`block w-5 h-5 border-2 rounded transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-gray-600'
                              }`}>
                                {isSelected && (
                                  <svg className="w-4 h-4 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </label>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePreview(note)}
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(note)}
                              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('Delete button clicked for note:', note.id)
                                setError('')
                                setSuccess('')
                                setDeleteNote(note)
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
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
                )
              })}
            </div>
          </div>
        )}

        {/* Note Form Modal */}
        <NoteFormModal
          showFormModal={showFormModal}
          editingNote={editingNote}
          formData={formData}
          formLoading={formLoading}
          error={error}
          success={success}
          teams={teams}
          handleFormChange={handleFormChange}
          handleSubmit={handleSubmit}
          handleCancelForm={handleCancelForm}
        />

        {/* Note Preview Modal */}
        <NotePreviewModal
          previewNote={previewNote}
          handleClosePreview={handleClosePreview}
          handleEdit={handleEdit}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={!!deleteNote}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
          itemName={deleteNote?.content?.substring(0, 50) + '...'}
          loading={deleteLoading}
          error={error}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={bulkDeleteOpen}
          onClose={handleCloseBulkDeleteModal}
          onConfirm={handleBulkDelete}
          title="Delete Multiple Notes"
          message={`Are you sure you want to delete ${selectedNotes.size} selected note(s)? This action cannot be undone.`}
          itemName={`${selectedNotes.size} note(s) will be permanently deleted`}
          loading={deleteLoading}
          error={error}
        />
      </div>
    </div>
  )
}