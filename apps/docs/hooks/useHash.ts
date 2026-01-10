import { useState, useCallback, useEffect } from 'react'

const useHash = () => {
  const [hash, setHash] = useState<string | undefined>(undefined)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setHash(window.location.hash.split('#')[1])
  }, [])

  const hashChangeHandler = useCallback(() => {
    setHash(window.location.hash.split('#')[1])
  }, [])

  useEffect(() => {
    if (!isMounted) return
    window.addEventListener('hashchange', hashChangeHandler)
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler)
    }
  }, [hashChangeHandler, isMounted])

  const updateHash = useCallback(
    (newHash) => {
      if (newHash !== hash && isMounted) window.location.hash = newHash
    },
    [hash, isMounted]
  )

  return [hash, updateHash] as const
}

export default useHash
