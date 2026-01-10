import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Use placeholder values during build if env vars are not set to avoid build-time errors
const supabaseUrl = process.env.NEXT_PUBLIC_MISC_USE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_MISC_USE_ANON_KEY || 'placeholder-anon-key'

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type SupabaseClient = typeof supabase

export default supabase
