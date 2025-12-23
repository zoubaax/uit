import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Example hook demonstrating Supabase usage
 * You can create custom hooks for your specific Supabase operations
 */
export function useSupabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Example: Fetch data from a table
  const fetchData = async (tableName) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
      
      if (fetchError) throw fetchError
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    supabase,
    loading,
    error,
    fetchData,
  }
}

