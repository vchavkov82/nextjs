import { createServerClient } from '@supabase/ssr'

export function createClient() {
  return createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll(cookies) {
          // Cookie setting would be handled by the response headers
        },
      },
    }
  )
}
