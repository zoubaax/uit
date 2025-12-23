import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isCurrentUserAdmin, getCurrentAdmin } from '../utils/admin'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check initial session
    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.id)
      } else {
        setUser(null)
        setAdmin(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.id)
      } else {
        setUser(null)
        setAdmin(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setUser(null)
      setAdmin(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async (userId) => {
    try {
      const adminStatus = await isCurrentUserAdmin()
      setIsAdmin(adminStatus)

      if (adminStatus) {
        const adminData = await getCurrentAdmin()
        setAdmin(adminData)
      } else {
        setAdmin(null)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      setAdmin(null)
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        setUser(data.user)
        await checkAdminStatus(data.user.id)
        return { success: true, error: null }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setAdmin(null)
      setIsAdmin(false)
      return { success: true, error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    admin,
    isAdmin,
    loading,
    signIn,
    signOut,
    checkAdminStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

