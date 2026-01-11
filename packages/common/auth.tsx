'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type User, type Session, STORAGE_KEY } from './gotrue'

export type { User }

/* Auth Context */

type AuthState =
  | {
      session: Session | null
      error: Error | null
      isLoading: false
    }
  | {
      session: null
      error: Error | null
      isLoading: true
    }

export type AuthContext = {
  refreshSession: () => Promise<Session | null>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<void>
} & AuthState

export const AuthContext = createContext<AuthContext>({
  session: null,
  error: null,
  isLoading: true,
  refreshSession: () => Promise.resolve(null),
  signIn: () => Promise.resolve({ user: null, error: null }),
  signUp: () => Promise.resolve({ user: null, error: null }),
  signOut: () => Promise.resolve(),
})

export type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEY)
        if (token) {
          // In a real implementation, validate the token with the server
          // For now, we'll create a mock session
          const mockUser: User = {
            id: 1,
            email: 'user@localhost',
            created_at: new Date().toISOString(),
          }
          const mockSession: Session = {
            user: mockUser,
            token,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }
          setSession(mockSession)
        }
      } catch (err) {
        console.error('Failed to load session:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      // Mock authentication - replace with real API call
      if (email === 'admin@localhost' && password === 'password') {
        const mockUser: User = {
          id: 1,
          email,
          created_at: new Date().toISOString(),
        }
        const token = `mock_token_${Date.now()}`
        const mockSession: Session = {
          user: mockUser,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }

        localStorage.setItem(STORAGE_KEY, token)
        setSession(mockSession)
        return { user: mockUser, error: null }
      } else {
        const authError = new Error('Invalid credentials')
        setError(authError)
        return { user: null, error: authError }
      }
    } catch (err) {
      const authError = err as Error
      setError(authError)
      return { user: null, error: authError }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      // Mock registration - replace with real API call
      const mockUser: User = {
        id: Date.now(), // Simple ID generation
        email,
        created_at: new Date().toISOString(),
      }
      const token = `mock_token_${Date.now()}`
      const mockSession: Session = {
        user: mockUser,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      localStorage.setItem(STORAGE_KEY, token)
      setSession(mockSession)
      return { user: mockUser, error: null }
    } catch (err) {
      const authError = err as Error
      setError(authError)
      return { user: null, error: authError }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setSession(null)
      setError(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    // Mock refresh - in real implementation, validate token with server
    return session
  }, [session])

  const value: AuthContext = {
    session,
    error,
    isLoading,
    refreshSession,
    signIn,
    signUp,
    signOut,
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

// Convenience hooks for backward compatibility
export function useIsLoggedIn(): boolean {
  const { session } = useAuth()
  return !!session
}

export function useUser(): User | null {
  const { session } = useAuth()
  return session?.user || null
}

export function useIsUserLoading(): boolean {
  const { isLoading } = useAuth()
  return isLoading
}

// Utility functions for backward compatibility
// Note: These functions work with localStorage-based auth for non-React contexts
export async function getAccessToken(): Promise<string | null> {
  // For non-React contexts, check localStorage directly
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const token = localStorage.getItem('local.auth.token')
    return token
  } catch {
    return null
  }
}

export async function logOut(): Promise<void> {
  // For non-React contexts, clear localStorage directly
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('local.auth.token')
    } catch {
      // Ignore localStorage errors
    }
  }
}
