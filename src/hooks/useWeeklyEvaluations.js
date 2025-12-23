import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch and manage weekly evaluations for a team
 * @param {string} teamId - The team ID to fetch evaluations for
 * @returns {Object} - { evaluations, loading, error, refetch, createEvaluation }
 */
export function useWeeklyEvaluations(teamId) {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvaluations = async () => {
    if (!teamId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('weekly_evaluations')
        .select('*')
        .eq('team_id', teamId)
        .order('week_start_date', { ascending: false })

      if (fetchError) throw fetchError
      setEvaluations(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching weekly evaluations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createEvaluation = async (rating, feedback, weekStartDate) => {
    try {
      const { data, error: createError } = await supabase
        .from('weekly_evaluations')
        .insert({
          team_id: teamId,
          rating,
          feedback,
          week_start_date: weekStartDate,
        })
        .select()
        .single()

      if (createError) throw createError
      
      // Refresh evaluations list
      await fetchEvaluations()
      
      return { data, error: null }
    } catch (err) {
      console.error('Error creating weekly evaluation:', err)
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    fetchEvaluations()
  }, [teamId])

  return { 
    evaluations, 
    loading, 
    error, 
    refetch: fetchEvaluations, 
    createEvaluation 
  }
}

