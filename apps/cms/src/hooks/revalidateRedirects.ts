import type { CollectionAfterChangeHook } from 'payload'

export const revalidateRedirects: CollectionAfterChangeHook = async ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  try {
    const { revalidateTag } = await import('next/cache')
    // @ts-expect-error - revalidateTag types are incorrect when dynamically imported
    await revalidateTag('redirects')
  } catch {
    // no-op when not running inside Next runtime (e.g., during payload migrate)
  }

  return doc
}
