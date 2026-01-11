import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const draft = await draftMode()
  const { searchParams } = request.nextUrl
  const slug = searchParams.get('slug')
  const path = searchParams.get('path') || 'blog'

  // Disable Draft Mode by clearing the cookie
  draft.disable()

  // Redirect to the path from the fetched post
  redirect(slug ? `/${path}/${slug}` : `/${path}`)
}
