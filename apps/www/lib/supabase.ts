// Mock Supabase client for compatibility
// This provides the same interface as Supabase but doesn't connect to any external service

interface MockDatabase {
  // Define your database types here
  [key: string]: any
}

class MockSupabaseClient {
  constructor(url: string, key: string, options?: any) {}

  // Mock auth methods
  auth = {
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  }

  // Mock database methods
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        limit: () => ({ data: [], error: null }),
      }),
      limit: () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({ data: null, error: null }),
    }),
    update: () => ({
      eq: () => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null }),
    }),
  })

  // Mock storage methods
  storage = {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
    }),
  }

  // Mock realtime methods
  channel: () => ({
    subscribe: () => ({
      unsubscribe: () => {},
    }),
  })
}

// Create mock client
const supabase = new MockSupabaseClient('', '', {})

export type SupabaseClient = typeof supabase

export default supabase
