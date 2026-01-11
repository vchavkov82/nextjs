import '@code-hike/mdx/styles'
import 'config/code-hike.scss'
import '../styles/index.css'

import {
  AuthProvider,
  FeatureFlagProvider,
  IS_PLATFORM,
  ThemeProvider,
} from 'common'
import { DefaultSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { SonnerToaster, themes, TooltipProvider } from 'ui'
import { CommandProvider } from 'ui-patterns/CommandMenu'

import MetaFaviconsPagesRouter, {
  DEFAULT_FAVICON_ROUTE,
  DEFAULT_FAVICON_THEME_COLOR,
} from 'common/MetaFavicons/pages-router'
import { WwwCommandMenu } from '@/components/CommandMenu'
import { API_URL, APP_NAME, DEFAULT_META_DESCRIPTION } from '@/lib/constants'
import useDarkLaunchWeeks from '../hooks/useDarkLaunchWeeks'
import { AppProviders } from '@/components/AppProviders'

// Initialize WebSocket server on development mode (server-side only)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  import('common').then(({ initializeLocalServices }) => {
    initializeLocalServices(parseInt(process.env.WS_PORT || '8081')).catch((error) => {
      console.error('Failed to start WebSocket server:', error)
    })
  })
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const site_title = `${APP_NAME} | The Postgres Development Platform.`
  const { basePath } = useRouter()

  const isDarkLaunchWeek = useDarkLaunchWeeks()
  const forceDarkMode = isDarkLaunchWeek

  let applicationName = 'BA'
  let faviconRoute = DEFAULT_FAVICON_ROUTE
  let themeColor = DEFAULT_FAVICON_THEME_COLOR

  if (router.asPath?.includes('/launch-week/x')) {
    applicationName = 'BA LWX'
    faviconRoute = 'images/launchweek/lwx/favicon'
    themeColor = 'FFFFFF'
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <MetaFaviconsPagesRouter
        applicationName={applicationName}
        route={faviconRoute}
        themeColor={themeColor}
        includeManifest
        includeMsApplicationConfig
        includeRssXmlFeed
      />
      <DefaultSeo
        title={site_title}
        description={DEFAULT_META_DESCRIPTION}
        openGraph={{
          type: 'website',
          url: 'https://www.assistance.bg/',
          site_name: 'BA',
          images: [
            {
              url: `https://www.assistance.bg${basePath}/images/og/supabase-og.png`,
              width: 800,
              height: 600,
              alt: 'BA Og Image',
            },
          ],
        }}
        twitter={{
          handle: '@supabase',
          site: '@supabase',
          cardType: 'summary_large_image',
        }}
      />

      <AuthProvider>
        {/* [TODO] I think we need to deconflict with the providers in layout.tsx? */}
        <FeatureFlagProvider API_URL={API_URL} enabled={{ cc: true, ph: false }}>
          <ThemeProvider
            themes={themes.map((theme) => theme.value)}
            enableSystem
            disableTransitionOnChange
            forcedTheme={forceDarkMode ? 'dark' : undefined}
          >
            <TooltipProvider delayDuration={0}>
              <CommandProvider app="www">
                <SonnerToaster position="top-right" />
                <Component {...pageProps} />
                <WwwCommandMenu />
                <AppProviders API_URL={API_URL} />
              </CommandProvider>
            </TooltipProvider>
          </ThemeProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </>
  )
}
