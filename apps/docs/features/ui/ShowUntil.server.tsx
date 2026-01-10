import { type ReactNode } from 'react'
import { ShowUntil as ShowUntilClient } from './ShowUntil'

/**
 * Server-compatible wrapper for ShowUntil client component.
 * This wrapper can be safely passed to compileMDX in RSC context.
 */
export function ShowUntil({ children, date }: { children: ReactNode; date: string }) {
  return <ShowUntilClient date={date}>{children}</ShowUntilClient>
}
