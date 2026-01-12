import { createClient } from '@/registry/default/clients/tanstack/lib/supabase/server'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

const confirmFn = createServerFn({ method: 'GET' }).handler(async () => {
    const request = getRequest()

    if (!request) {
      throw redirect({ to: `/auth/error`, search: { error: 'No request' } })
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code') as string
    const _next = (url.searchParams.get('next') ?? '/') as string
    const next = _next?.startsWith('/') ? _next : '/'

    if (code) {
      const supabase = createClient()

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // redirect user to specified redirect URL or root of app
        throw redirect({ href: next })
      } else {
        // redirect the user to an error page with some instructions
        throw redirect({
          to: `/auth/error`,
          search: { error: error?.message },
        })
      }
    }

    // redirect the user to an error page with some instructions
    throw redirect({
      to: `/auth/error`,
      search: { error: 'No code found' },
    })
  })

export const Route = createFileRoute('/auth/oauth' as any)({
  preload: false,
  loader: () => confirmFn(),
})
