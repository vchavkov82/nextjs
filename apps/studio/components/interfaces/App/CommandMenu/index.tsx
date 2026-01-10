'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import { useCommandMenuInitiated } from 'ui-patterns/CommandMenu'

const LazyCommandMenu = dynamic(() => import('./CommandMenu'), { ssr: false })

export const StudioCommandMenu = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render after mount to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return <StudioCommandContent />
}

function StudioCommandContent() {
  const isInitiated = useCommandMenuInitiated()
  return isInitiated && <LazyCommandMenu />
}
