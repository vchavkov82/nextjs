import BlogClient from './BlogClient'
import { getSortedPosts } from 'lib/posts'
import { getAllCMSPosts } from 'lib/get-cms-posts'
import type { Metadata } from 'next'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'BA Blog: the Postgres development platform',
  description: 'Get all your BA News on the BA blog.',
  openGraph: {
    title: 'BA Blog: the Postgres development platform',
    description: 'Get all your BA News on the BA blog.',
    url: 'https://www.assistance.bg/blog',
    images: [{ url: 'https://www.assistance.bg/images/og/supabase-og.png' }],
  },
}

const INITIAL_POSTS_LIMIT = 5 // Reduced to 5 posts for testing

export default async function BlogPage() {
  try {
    // Get static blog posts - limit to 5 for testing
    const staticPostsData = getSortedPosts({ directory: '_blog', limit: 5, runner: '** BLOG PAGE **' })
    console.log('[BlogPage] Static posts found:', staticPostsData.length)

    // Get CMS posts server-side with revalidation - limit to 5 for testing
    const cmsPostsData = await getAllCMSPosts({ limit: 5 })
    console.log('[BlogPage] CMS posts found:', cmsPostsData.length)

    // Combine static and CMS posts and sort by date
    const allPosts = [...staticPostsData, ...cmsPostsData].sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.formattedDate).getTime()
      const dateB = new Date(b.date || b.formattedDate).getTime()
      return dateB - dateA
    })

    console.log('[BlogPage] Total posts after combining:', allPosts.length)

    // Only send initial posts to client, rest will be loaded via API
    const initialPosts = allPosts.slice(0, INITIAL_POSTS_LIMIT)
    const totalPosts = allPosts.length

    console.log('[BlogPage] Sending to client:', { initialPosts: initialPosts.length, totalPosts })

    return <BlogClient initialBlogs={initialPosts} totalPosts={totalPosts} />
  } catch (error) {
    console.error('[BlogPage] Error loading blog posts:', error)
    return <BlogClient initialBlogs={[]} totalPosts={0} />
  }
}
