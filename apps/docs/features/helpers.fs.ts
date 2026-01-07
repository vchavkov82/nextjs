import { watch } from 'node:fs'
import { stat } from 'node:fs/promises'

import type { OrPromise } from '~/features/helpers.types'
import { IS_DEV } from '~/lib/constants'

/**
 * Caches a function for the length of the server process.
 *
 * In DEV, watches a directory to cache bust on edit.
 */
export const cache_fullProcess_withDevCacheBust = <Args extends unknown[], Output>(
  /**
   * The function whose results to cache
   */
  fn: (...args: Args) => OrPromise<Output>,
  /**
   * The directory to watch for edits
   */
  watchDirectory: string,
  /**
   * A function that generates the cache key to bust, given the changed
   * filename (relative to the watch directory)
   */
  genCacheKeyFromFilename: (filename: string) => string
) => {
  const _cache = new Map<string, Output>()

  if (IS_DEV) {
    watch(watchDirectory, { recursive: true }, (_, filename) => {
      if (!filename) return
      const cacheKey = genCacheKeyFromFilename(filename)
      _cache.delete(cacheKey)
    })
  }

  return async (...args: Args) => {
    const cacheKey = JSON.stringify(args)
    if (!_cache.has(cacheKey)) {
      const result = await fn(...args)
      _cache.set(cacheKey, result)
      return result
    }
    const cached = _cache.get(cacheKey)
    if (cached === undefined) {
      // This shouldn't happen, but handle it defensively
      const result = await fn(...args)
      _cache.set(cacheKey, result)
      return result
    }
    return cached
  }
}

export const existsFile = async (fullPath: string) => {
  try {
    await stat(fullPath)
    return true
  } catch {
    return false
  }
}
