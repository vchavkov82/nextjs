import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

// Avoid importing next/cache at module scope so migrations can run in a plain Node env

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/posts/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)
      try {
        const { revalidatePath, revalidateTag } = await import('next/cache')
        await revalidatePath(path)
        // @ts-expect-error - revalidateTag types are incorrect when dynamically imported
        await revalidateTag('posts-sitemap')
      } catch {}
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      try {
        const { revalidatePath, revalidateTag } = await import('next/cache')
        await revalidatePath(oldPath)
        // @ts-expect-error - revalidateTag types are incorrect when dynamically imported
        await revalidateTag('posts-sitemap')
      } catch {}
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = async ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`
    try {
      const { revalidatePath, revalidateTag } = await import('next/cache')
      await revalidatePath(path)
      // @ts-expect-error - revalidateTag types are incorrect when dynamically imported
      await revalidateTag('posts-sitemap')
    } catch {}
  }

  return doc
}
