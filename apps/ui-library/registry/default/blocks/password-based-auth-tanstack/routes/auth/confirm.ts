import { createClient } from '@/registry/default/clients/tanstack/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

const confirmFn = createServerFn({ method: 'GET' }).handler(async () => {
    const request = getRequest()

    if (!request) {
      throw redirect({ to: `/auth/error`, search: { error: 'No request' } })
    }

    const url = new URL(request.url)
    const token_hash = url.searchParams.get('token_hash') as string
    const type = url.searchParams.get('type') as EmailOtpType | null
    const _next = url.searchParams.get('next') as string
    const next = _next?.startsWith('/') ? _next : '/'

    if (token_hash && type) {
      const supabase = createClient()

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      console.log(error?.message)
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
      search: { error: 'No token hash or type' },
    })
  })

export const Route = createFileRoute('/auth/confirm')({
  preload: false,
  loader: () => confirmFn(),
})
