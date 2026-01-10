'use client'

import type { PropsWithChildren } from 'react'

import { CommandProvider } from 'ui-patterns/CommandMenu'

export function DocsCommandProvider({ children }: PropsWithChildren) {
  return (
    <CommandProvider app="docs">
      {children}
    </CommandProvider>
  )
}
