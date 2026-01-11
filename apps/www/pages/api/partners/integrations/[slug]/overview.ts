import { type NextApiRequest, type NextApiResponse } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import { type CodeHikeConfig, remarkCodeHike } from '@code-hike/mdx'
import codeHikeTheme from 'config/code-hike.theme.json' with { type: 'json' }

import supabase from '@/lib/supabaseMisc'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  try {
    const { data: partner } = await supabase
      .from('partners')
      .select('overview')
      .eq('approved', true)
      .eq('slug', slug)
      .single()

    if (!partner || !partner.overview) {
      return res.status(404).json({ error: 'Partner not found' })
    }

    const codeHikeOptions: CodeHikeConfig = {
      theme: codeHikeTheme,
      lineNumbers: true,
      showCopyButton: true,
      skipLanguages: [],
      autoImport: false,
    }

    // Parse markdown
    const overview = await serialize(partner.overview, {
      parseFrontmatter: false, // Avoid getData error in next-mdx-remote v5
      mdxOptions: {
        useDynamicImport: true,
        remarkPlugins: [remarkGfm, [remarkCodeHike, codeHikeOptions]],
      },
    })

    // Cache for 30 minutes (same as page revalidation)
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    return res.status(200).json({ overview })
  } catch (error) {
    console.error('Error serializing overview:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
