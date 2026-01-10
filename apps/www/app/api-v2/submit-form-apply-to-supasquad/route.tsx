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
  const fullName =
    `${data.first_name?.trim() || ''} ${data.last_name?.trim() || ''}`.trim() || 'Unnamed'

  const props: Record<string, any> = {
    Name: {
      title: [{ type: 'text', text: { content: fullName } }],
    },
    'First name': {
      rich_text: [{ type: 'text', text: { content: data.first_name || '' } }],
    },
    'Last name': {
      rich_text: [{ type: 'text', text: { content: data.last_name || '' } }],
    },
    Email: { email: data.email },
    'What track would you like to be considered for?': {
      multi_select: asMultiSelect(data.tracks.map(normalizeTrack)),
    },
    'Product areas of interest': {
      multi_select: asMultiSelect(data.areas_of_interest),
    },
    'Languages spoken': {
      multi_select: asMultiSelect(data.languages_spoken),
    },
    'Date submitted': {
      date: { start: new Date().toISOString().split('T')[0] },
    },
    Country: {
      select: { name: data.country },
    },
    City: {
      rich_text: [{ type: 'text', text: { content: truncateRichText(data.city, 120) } }],
    },
    Location: {
      rich_text: [
        { type: 'text', text: { content: truncateRichText(data.city + ', ' + data.country, 120) } },
      ],
    },
  }
  if (data.contributions) {
    props['Recent Contributions'] = {
      rich_text: [{ type: 'text', text: { content: truncateRichText(data.contributions, 1900) } }],
    }
  }
  if (data.monthly_commitment) {
    props['Monthly commitment'] = {
      rich_text: [{ type: 'text', text: { content: truncateRichText(data.monthly_commitment) } }],
    }
  }
  if (data.skills) {
    props['Skills (frameworks, tools, languages)'] = {
      rich_text: [{ type: 'text', text: { content: truncateRichText(data.skills) } }],
    }
  }
  if (data.why_you_want_to_join) {
    props['Why do you want to join the program'] = {
      rich_text: [
        { type: 'text', text: { content: truncateRichText(data.why_you_want_to_join, 1800) } },
      ],
    }
  }
  if (data.discord) {
    props['Discord username'] = {
      rich_text: [{ type: 'text', text: { content: data.discord } }],
    }
  }
  if (data.github) {
    props['GitHub Profile'] = {
      rich_text: [{ type: 'text', text: { content: data.github } }],
    }
  }
  if (data.twitter) {
    props['Twitter handle'] = {
      rich_text: [{ type: 'text', text: { content: data.twitter } }],
    }
  }

  return props
}
