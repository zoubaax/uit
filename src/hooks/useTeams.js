import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch and manage teams
 * @returns {Object} - { teams, loading, error, refetch }
 */
export function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setTeams(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return { teams, loading, error, refetch: fetchTeams }
}

