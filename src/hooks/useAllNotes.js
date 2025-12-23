import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch all notes (for admin management)
 * @returns {Object} - { notes, loading, error, refetch }
 */
export function useAllNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select(`
          *,
          teams:team_id (
            id,
            name
          )
        `)
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

  useEffect(() => {
    fetchNotes()
  }, [])

  return { notes, loading, error, refetch: fetchNotes }
}

