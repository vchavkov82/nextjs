import type { PropsWithChildren } from 'react'

import { FeatureFlagProvider, IS_PLATFORM, ThemeProvider } from 'common'
import dynamic from 'next/dynamic'
import { SonnerToaster, TooltipProvider } from 'ui'
import { API_URL } from '~/lib/constants'
import { AuthContainer } from './auth/auth.client'
import { DocsCommandProvider } from './command'
import { QueryClientProvider } from './data/queryClient.client'
import { PageTelemetry } from './telemetry/telemetry.client'
import { ScrollRestoration } from './ui/helpers.scroll.client'

const SiteLayout = dynamic(() => import('~/layouts/SiteLayout'), {
  ssr: true,
})

const DocsCommandMenu = dynamic(
  () => import('./command').then((mod) => ({ default: mod.DocsCommandMenu })),
  {
    ssr: false,
  }
)

const ThemeSandbox = dynamic(() => import('./ui/theme.client').then((mod) => ({ default: mod.ThemeSandbox })), {
  ssr: false,
})

/**
 * Global providers that wrap the entire app
 */
function GlobalProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider>
      <AuthContainer>
        <FeatureFlagProvider API_URL={API_URL} enabled={IS_PLATFORM}>
          <PageTelemetry />
          <ScrollRestoration />
          <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange attribute="class">
            <TooltipProvider delayDuration={0}>
              <DocsCommandProvider>
                <div className="flex flex-col">
                  <SiteLayout>
                    {children}
                    <DocsCommandMenu />
                  </SiteLayout>
                  <ThemeSandbox />
                </div>
              </DocsCommandProvider>
              <SonnerToaster position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </FeatureFlagProvider>
      </AuthContainer>
    </QueryClientProvider>
  )
}

export { GlobalProviders }
