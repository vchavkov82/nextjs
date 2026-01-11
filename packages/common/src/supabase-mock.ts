// Comprehensive Supabase mock for compatibility with local WebSocket infrastructure
// This provides all the interfaces and constants that existing code expects
// but now with functional Realtime support via RealtimeAdapter

import { RealtimeAdapter, RealtimeChannel } from './realtime-adapter'

// Mock enums and constants
export const REALTIME_CHANNEL_STATES = {
  closed: 'closed',
  errored: 'errored',
  joined: 'joined',
  joining: 'joining',
  leaving: 'leaving',
} as const

export const REALTIME_SUBSCRIBE_STATES = {
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMEOUT: 'TIMEOUT',
  SUBSCRIBED: 'SUBSCRIBED',
} as const

// Mock types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at?: string
  aud?: string
  role?: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  token_type: string
  user: User
}

export interface AuthError {
  message: string
  status?: number
}

// Mock classes and functions
export class MockSupabaseClient {
  private realtimeAdapter: RealtimeAdapter

  constructor(url: string, key: string, options?: any) {
    // Get WebSocket URL from environment or use default
    const wsUrl = typeof window !== 'undefined'
      ? (window as any).NEXT_PUBLIC_WS_URL || 'ws://localhost:8081'
      : process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081'

    this.realtimeAdapter = new RealtimeAdapter(wsUrl)

    // Auto-connect in browser environment
    if (typeof window !== 'undefined') {
      this.realtimeAdapter.connect().catch((error) => {
        console.warn('Failed to connect to WebSocket server:', error)
      })
    }
  }

  // Auth methods (non-functional stub for compatibility)
  auth = {
    signIn: async (credentials: any) => ({
      data: { user: null, session: null },
      error: null
    }),
    signUp: async (credentials: any) => ({
      data: { user: null, session: null },
      error: null
    }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
  }

  // Database methods (non-functional stub for compatibility)
  from(table: string) {
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          limit: (count: number) => ({ data: [], error: null }),
          order: (column: string) => ({ data: [], error: null }),
        }),
        limit: (count: number) => ({ data: [], error: null }),
        order: (column: string) => ({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      insert: (values: any) => ({
        select: (columns?: string) => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({ data: null, error: null }),
        select: (columns?: string) => ({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({ data: null, error: null }),
      }),
    }
  }

  // Storage methods (non-functional stub for compatibility)
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: null, error: null }),
      download: async (path: string) => ({ data: null, error: null }),
      remove: async (paths: string[]) => ({ data: null, error: null }),
      list: async (path?: string) => ({ data: [], error: null }),
    }),
  }

  // Realtime methods - NOW FUNCTIONAL
  channel(name: string, config?: any): RealtimeChannel {
    return this.realtimeAdapter.channel(name, config)
  }

  removeChannel(channel: RealtimeChannel): void {
    return this.realtimeAdapter.removeChannel(channel)
  }

  // Realtime property for compatibility
  get realtime() {
    return {
      setAuth: async (token: string) => {
        // WebSocket authentication is handled automatically
        // Tokens are sent during channel subscription if needed
      }
    }
  }
}

// Factory function
export function createClient(url?: string, key?: string, options?: any): MockSupabaseClient {
  return new MockSupabaseClient(url || '', key || '', options)
}

// Re-export everything for compatibility
export * from './supabase-mock'