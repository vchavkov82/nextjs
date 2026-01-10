import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

import type { Event } from '../../../payload-types'

export const revalidateEvent: CollectionAfterChangeHook<Event> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/events/${doc.slug}`

      payload.logger.info(`Revalidating event at path: ${path}`)
      try {
        await revalidatePath(path, 'page')
        revalidateTag('events-sitemap', {})
      } catch {}
    }

    // If the event was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/events/${previousDoc.slug}`

      payload.logger.info(`Revalidating old event at path: ${oldPath}`)

      try {
        await revalidatePath(oldPath, 'page')
        revalidateTag('events-sitemap', {})
      } catch {}
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Event> = async ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/events/${doc?.slug}`
    try {
      await revalidatePath(path, 'page')
      revalidateTag('events-sitemap', {})
    } catch {}
  }

  return doc
}
