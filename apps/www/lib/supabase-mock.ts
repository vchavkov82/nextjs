// Comprehensive Supabase mock for the www app
// This provides all the interfaces and constants that existing code expects

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
  constructor(url: string, key: string, options?: any) {}

  // Auth methods
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
  };

  // Database methods
  from = (table: string) => ({
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
  });

  // Storage methods
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: null, error: null }),
      download: async (path: string) => ({ data: null, error: null }),
      remove: async (paths: string[]) => ({ data: null, error: null }),
      list: async (path?: string) => ({ data: [], error: null }),
    }),
  };

  // Realtime methods
  channel = (name: string) => ({
    state: REALTIME_CHANNEL_STATES.closed,
    subscribe: (callback?: any) => ({
      unsubscribe: () => {},
    }),
    unsubscribe: () => {},
    send: (payload: any) => {},
  });

  // Remove channel subscription
  removeChannel = (channel: any) => {};
}

// Factory function
export function createClient(url?: string, key?: string, options?: any): MockSupabaseClient {
  return new MockSupabaseClient(url || '', key || '', options)
}

// Re-export everything
export default createClient