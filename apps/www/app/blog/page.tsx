import BlogClient from './BlogClient'
import { getSortedPosts } from 'lib/posts'
import type { Metadata } from 'next'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Supabase Blog: the Postgres development platform',
  description: 'Get all your Supabase News on the Supabase blog.',
  openGraph: {
    title: 'Supabase Blog: the Postgres development platform',
    description: 'Get all your Supabase News on the Supabase blog.',
    url: 'https://supabase.com/blog',
    images: [{ url: 'https://supabase.com/images/og/supabase-og.png' }],
  },
}

const INITIAL_POSTS_LIMIT = 2 // Limit to 2 posts for reference

export default async function BlogPage() {
  try {
    // Get static blog posts - limit to 2 for reference
    const staticPostsData = getSortedPosts({ directory: '_blog', limit: 2, runner: '** BLOG PAGE **' })

    // Don't fetch CMS posts - only use static posts for reference
    const cmsPostsData: any[] = []

    // Combine static and CMS posts and sort by date
    const allPosts = [...staticPostsData, ...cmsPostsData].sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.formattedDate).getTime()
      const dateB = new Date(b.date || b.formattedDate).getTime()
      return dateB - dateA
    })

    // Only send initial posts to client, rest will be loaded via API
    const initialPosts = allPosts.slice(0, INITIAL_POSTS_LIMIT)
    const totalPosts = allPosts.length

    return <BlogClient initialBlogs={initialPosts} totalPosts={totalPosts} />
  } catch (error) {
    console.error('[BlogPage] Error loading blog posts:', error)
    // Return empty state if there's an error
    return <BlogClient initialBlogs={[]} totalPosts={0} />
  }
}
