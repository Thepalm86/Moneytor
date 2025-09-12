'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

// Debounce function to prevent excessive re-renders
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }) as T
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const userRef = useRef<User | null>(null)
  const loadingRef = useRef(true)

  // Debounced user setter to prevent rapid state changes
  const debouncedSetUser = useCallback(
    debounce((newUser: User | null, newLoading: boolean) => {
      // Only update if values actually changed
      if (userRef.current?.id !== newUser?.id || loadingRef.current !== newLoading) {
        userRef.current = newUser
        loadingRef.current = newLoading
        setUser(newUser)
        setLoading(newLoading)
      }
    }, 100),
    []
  )

  useEffect(() => {
    let mounted = true

    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          debouncedSetUser(session?.user ?? null, false)
        }
      } catch (error) {
        console.error('Error checking user session:', error)
        if (mounted) {
          debouncedSetUser(null, false)
        }
      }
    }

    checkUser()

    // Listen for changes on auth state with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        // Only process significant auth events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          debouncedSetUser(session?.user ?? null, false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [debouncedSetUser])

  // Memoized signOut function to prevent recreating on every render
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    signOut
  }), [user, loading, signOut])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}