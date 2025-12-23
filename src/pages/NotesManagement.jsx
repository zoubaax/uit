import { useState, useMemo } from 'react'
import { useAllNotes } from '../hooks/useAllNotes'
import { useTeams } from '../hooks/useTeams'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import NoteForm from '../components/NoteForm'
import NotePreview from '../components/NotePreview'
import DeleteConfirmation from '../components/DeleteConfirmation'

export default function NotesManagement() {
  const { notes, loading, refetch } = useAllNotes()
  const { teams } = useTeams()
  const { user } = useAuth()
  
  const [editingNote, setEditingNote] = useState(null)
  const [previewNote, setPreviewNote] = useState(null)
  const [showForm, setShowForm] = useState(false)
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

  // Get unique categories from notes
  const categories = useMemo(() => {
    const cats = new Set()
    notes.forEach(note => {
      if (note.category) cats.add(note.category)
    })
    return Array.from(cats).sort()
  }, [notes])

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

  const handleCreate = () => {
    setEditingNote(null)
    setPreviewNote(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setPreviewNote(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handlePreview = (note) => {
    const team = teams.find(t => t.id === note.team_id)
    setPreviewNote({ ...note, teamName: team?.name })
    setShowForm(false)
    setEditingNote(null)
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingNote) {
        // When editing, preserve team_id and created_by
        const updateData = {
          content: formData.content,
          category: formData.category,
          // Keep original team_id and created_by when editing
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
        setShowForm(false)
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
    if (!deleteNote) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', deleteNote.id)

      if (deleteError) throw deleteError
      
      setSuccess('Note deleted successfully!')
      await refetch()
      setDeleteNote(null)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err.message || 'Failed to delete note')
    } finally {
      setFormLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotes.size === 0) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const noteIds = Array.from(selectedNotes)
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .in('id', noteIds)

      if (deleteError) throw deleteError
      
      setSuccess(`${noteIds.length} note(s) deleted successfully!`)
      setSelectedNotes(new Set())
      setBulkDeleteOpen(false)
      await refetch()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error deleting notes:', err)
      setError(err.message || 'Failed to delete notes')
    } finally {
      setFormLoading(false)
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

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingNote(null)
    setPreviewNote(null)
    setError('')
    setSuccess('')
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create, edit, and manage notes for all teams
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
            Create Note
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
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <NoteForm
            note={editingNote}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            loading={formLoading}
            currentUserId={user?.id}
          />
        </div>
      )}

      {/* Preview */}
      {previewNote && (
        <div className="mb-6">
          <NotePreview note={previewNote} teamName={previewNote.teamName} />
          <button
            onClick={() => setPreviewNote(null)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
          >
            Close Preview
          </button>
        </div>
      )}

      {/* Filters */}
      {!showForm && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label htmlFor="filter-category" className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              <label htmlFor="filter-date" className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                id="filter-date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
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
            Showing {filteredNotes.length} of {notes.length} notes
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {!showForm && selectedNotes.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">
              {selectedNotes.size} note(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedNotes(new Set())}
                className="text-sm text-yellow-800 hover:text-yellow-900"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading notes...</div>
        </div>
      ) : filteredNotes.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
          <p className="mt-1 text-sm text-gray-500">
            {notes.length === 0
              ? 'Get started by creating a new note.'
              : 'No notes match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {/* Select All */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNotes.size === filteredNotes.length && filteredNotes.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Select All</span>
            </label>
          </div>

          <ul className="divide-y divide-gray-200">
            {filteredNotes.map((note) => {
              const isSelected = selectedNotes.has(note.id)
              const team = teams.find(t => t.id === note.team_id)
              
              return (
                <li key={note.id} className={isSelected ? 'bg-indigo-50' : ''}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleNoteSelection(note.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0 ml-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-indigo-600">
                                {team?.name || 'Unknown Team'}
                              </p>
                              {note.category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {note.category}
                                </span>
                              )}
                              {note.created_by ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
                              {note.content}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              {new Date(note.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                              onClick={() => handlePreview(note)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleEdit(note)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteNote(note)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
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
        isOpen={!!deleteNote}
        onClose={() => setDeleteNote(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        itemName={deleteNote?.content?.substring(0, 50) + '...'}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Notes"
        message={`Are you sure you want to delete ${selectedNotes.size} selected note(s)?`}
        itemName={`${selectedNotes.size} note(s) will be permanently deleted`}
      />
    </div>
  )
}

