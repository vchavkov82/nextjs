'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import { useCommandMenuInitiated } from 'ui-patterns/CommandMenu'
import { DocsCommandProvider } from './DocsCommandProvider'

const LazyCommandMenu = dynamic(() => import('./CommandMenu'), { ssr: false })

const DocsCommandMenu = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render after mount to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return <DocsCommandContent />
}

function DocsCommandContent() {
  const isInitiated = useCommandMenuInitiated()
  return isInitiated && <LazyCommandMenu />
}

export { DocsCommandMenu, DocsCommandProvider }
