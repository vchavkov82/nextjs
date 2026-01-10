'use client'

import { type ReactNode, useState, useEffect } from 'react'

export function ShowUntil({ children, date }: { children: ReactNode; date: string }) {
  const [shouldShow, setShouldShow] = useState(true) // Default to showing on server
  
  useEffect(() => {
    const currentDate = new Date()
    const untilDate = new Date(date)
    
    if (isNaN(untilDate.getTime()) || currentDate < untilDate) {
      setShouldShow(true)
    } else {
      setShouldShow(false)
    }
  }, [date])

  // Always render children on server (and initial client render) to avoid hydration mismatch
  // The useEffect will hide it on client if the date has passed
  return shouldShow ? <>{children}</> : null
}
