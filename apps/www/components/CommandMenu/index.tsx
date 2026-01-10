'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import { useCommandMenuInitiated } from 'ui-patterns/CommandMenu'

const LazyCommandMenu = dynamic(() => import('./CommandMenu'), { ssr: false })

export function WwwCommandMenu() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render after mount to prevent hydration mismatch
  // Server renders nothing, client renders based on isInitiated state
  if (!isMounted) {
    return null
  }

  return <CommandMenuContent />
}

function CommandMenuContent() {
  const isInitiated = useCommandMenuInitiated()
  return isInitiated && <LazyCommandMenu />
}
