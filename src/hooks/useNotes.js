import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch and manage notes for a team
 * @param {string} teamId - The team ID to fetch notes for
 * @returns {Object} - { notes, loading, error, refetch, createNote }
 */
export function useNotes(teamId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = async () => {
    if (!teamId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setNotes(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (content, category = null, createdBy = null) => {
    try {
      const { data, error: createError } = await supabase
        .from('notes')
        .insert({
          content,
          team_id: teamId,
          category,
          created_by: createdBy,
        })
        .select()
        .single()

      if (createError) throw createError
      
      // Refresh notes list
      await fetchNotes()
      
      return { data, error: null }
    } catch (err) {
      console.error('Error creating note:', err)
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [teamId])

  return { notes, loading, error, refetch: fetchNotes, createNote }
}

