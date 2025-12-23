import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch all weekly evaluations (for admin management)
 * @returns {Object} - { evaluations, loading, error, refetch }
 */
export function useAllEvaluations() {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('weekly_evaluations')
        .select(`
          *,
          teams:team_id (
            id,
            name
          )
        `)
        .order('week_start_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setEvaluations(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching evaluations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvaluations()
  }, [])

  return { evaluations, loading, error, refetch: fetchEvaluations }
}

