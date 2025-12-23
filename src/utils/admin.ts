import { supabase } from '../lib/supabase'

/**
 * Check if the current authenticated user is an admin
 * @returns Promise<boolean> - true if user is an admin, false otherwise
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .rpc('is_admin', { user_id: user.id })

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data === true
}

/**
 * Get admin information for the current user
 * @returns Promise<Admin | null> - Admin object if user is admin, null otherwise
 */
export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching admin:', error)
    return null
  }

  return data
}

