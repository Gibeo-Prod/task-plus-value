import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export type UserRole = 'admin' | 'user'

export interface UserWithRoles {
  id: string
  email: string
  full_name?: string
  roles: UserRole[]
}

export const useUserRoles = () => {
  const { user } = useAuth()
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [allUsers, setAllUsers] = useState<UserWithRoles[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserRoles = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (error) throw error

      const roles = data.map(r => r.role as UserRole)
      setUserRoles(roles)
      setIsAdmin(roles.includes('admin'))
    } catch (error) {
      console.error('Error fetching user roles:', error)
    }
  }

  const fetchAllUsers = async () => {
    if (!isAdmin) return

    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')

      if (profilesError) throw profilesError

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      // Combine the data
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => {
        const userRoles = (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as UserRole)
        
        return {
          id: profile.id,
          email: `user-${profile.id.slice(0, 8)}@sistema.com`, // Placeholder
          full_name: profile.full_name,
          roles: userRoles
        }
      })

      setAllUsers(usersWithRoles)
    } catch (error) {
      console.error('Error fetching all users:', error)
    }
  }

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (error) throw error

      // Refresh users list
      await fetchAllUsers()
    } catch (error) {
      console.error('Error assigning role:', error)
      throw error
    }
  }

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)

      if (error) throw error

      // Refresh users list
      await fetchAllUsers()
    } catch (error) {
      console.error('Error removing role:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserRoles().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers()
    }
  }, [isAdmin])

  return {
    userRoles,
    isAdmin,
    allUsers,
    loading,
    assignRole,
    removeRole,
    refreshUsers: fetchAllUsers,
    refreshRoles: fetchUserRoles
  }
}