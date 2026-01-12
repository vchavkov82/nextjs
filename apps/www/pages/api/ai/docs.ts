import { ApplicationError, UserError } from 'ai-commands/edge'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: 'AI docs endpoint disabled - Supabase connectivity has been removed',
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
