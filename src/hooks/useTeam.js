import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch a single team by ID
 * @param {string} teamId - The team ID
 * @returns {Object} - { team, loading, error, refetch }
 */
export function useTeam(teamId) {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeam = async () => {
    if (!teamId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (fetchError) throw fetchError
      setTeam(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching team:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [teamId])

  return { team, loading, error, refetch: fetchTeam }
}

