'use client'

import { Suspense } from 'react'
import {
  AuthProvider,
  FeatureFlagProvider,
  IS_PLATFORM,
  ThemeProvider,
} from 'common'
import { WwwCommandMenu } from 'components/CommandMenu'
import { API_URL } from 'lib/constants'
import { themes, TooltipProvider, SonnerToaster } from 'ui'
import { CommandProvider } from 'ui-patterns/CommandMenu'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <AuthProvider>
        <FeatureFlagProvider API_URL={API_URL} enabled={IS_PLATFORM}>
          <ThemeProvider themes={themes.map((t) => t.value)} enableSystem disableTransitionOnChange>
            <TooltipProvider delayDuration={0}>
              <CommandProvider>
                <SonnerToaster position="top-right" />
                <Suspense fallback={null}>{children}</Suspense>
                <WwwCommandMenu />
              </CommandProvider>
            </TooltipProvider>
          </ThemeProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </NuqsAdapter>
  )
}

export default Providers
