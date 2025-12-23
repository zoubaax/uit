import { useState, useEffect } from 'react'
import { isCurrentUserAdmin, getCurrentAdmin } from '../utils/admin'

/**
 * Hook to check if current user is an admin
 * @returns {Object} - { isAdmin, admin, loading, error }
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function checkAdmin() {
      try {
        setLoading(true)
        const adminStatus = await isCurrentUserAdmin()
        setIsAdmin(adminStatus)
        
        if (adminStatus) {
          const adminData = await getCurrentAdmin()
          setAdmin(adminData)
        }
      } catch (err) {
        setError(err.message)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  return { isAdmin, admin, loading, error }
}

