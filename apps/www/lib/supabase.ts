import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Only create client if URL is provided to avoid build-time errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Always create client with a placeholder URL during build to avoid errors
// The client will fail at runtime if env vars are not set, but won't fail the build
const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 1000,
      },
    },
  }
)

export type SupabaseClient = typeof supabase

export default supabase
