import {
  SupaSquadApplication,
  supaSquadApplicationSchema,
} from '@/data/open-source/contributing/supasquad.utils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
}

export async function OPTIONS() {
  return new Response('ok', { headers: corsHeaders })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch (error: any) {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  const parsed = supaSquadApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ message: parsed.error.flatten() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 422,
    })
  }

  // External service integrations removed
  return new Response(JSON.stringify({ message: 'Submission successful' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 201,
  })
}
