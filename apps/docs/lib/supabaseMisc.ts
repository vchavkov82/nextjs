import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabaseMisc: SupabaseClient

export function supabaseMisc() {
  if (!_supabaseMisc) {
    const miscUrl = process.env.NEXT_PUBLIC_MISC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const miscKey = process.env.NEXT_PUBLIC_MISC_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!miscUrl || !miscKey) {
      throw new Error(
        'Missing required environment variables for supabaseMisc client. ' +
          'Set NEXT_PUBLIC_MISC_URL and NEXT_PUBLIC_MISC_ANON_KEY or use NEXT_PUBLIC_SUPABASE_* variables.'
      )
    }

    _supabaseMisc = createClient(miscUrl, miscKey)
  }

  return _supabaseMisc
}
