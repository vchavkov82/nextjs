import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

import type { Customer } from '../../../payload-types'

export const revalidateCustomer: CollectionAfterChangeHook<Customer> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/customers/${doc.slug}`

      payload.logger.info(`Revalidating event at path: ${path}`)
      try {
        await revalidatePath(path, 'page')
        revalidateTag('customers-sitemap', {})
      } catch {
        // no-op when not running inside Next runtime (e.g., during payload migrate)
      }
    }

    // If the event was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/customers/${previousDoc.slug}`

      payload.logger.info(`Revalidating old event at path: ${oldPath}`)

      try {
        await revalidatePath(oldPath, 'page')
        revalidateTag('customers-sitemap', {})
      } catch {}
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Customer> = async ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/customers/${doc?.slug}`
    try {
      await revalidatePath(path, 'page')
      revalidateTag('customers-sitemap', {})
    } catch {}
  }

  return doc
}
