import { type NextApiRequest, type NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(503).json({
    error: 'Partner overview endpoint disabled - Supabase connectivity has been removed',
  })
}
