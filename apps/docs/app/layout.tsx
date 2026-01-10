import '@code-hike/mdx/dist/index.css'
import '../styles/main.scss'

import { genFaviconData } from 'common/MetaFavicons/app-router'
import type { Metadata, Viewport } from 'next'
import { BASE_PATH, IS_PRODUCTION } from '~/lib/constants'
import { getCustomContent } from '~/lib/custom-content/getCustomContent'
import { Providers } from './providers'

const { metadataApplicationName, metadataTitle } = getCustomContent([
  'metadata:application_name',
  'metadata:title',
])

// Use a fixed date to avoid hydration mismatch from new Date() calls
const buildDate = new Date('2024-01-01').toISOString()

export const metadata: Metadata = {
  applicationName: metadataApplicationName,
  title: metadataTitle,
  description:
    'Supabase is the Postgres development platform providing all the backend features you need to build a product.',
  metadataBase: new URL('https://www.assistance.bg'),
  icons: genFaviconData(BASE_PATH),
  robots: {
    index: IS_PRODUCTION,
    follow: IS_PRODUCTION,
  },
  openGraph: {
    type: 'article',
    authors: 'Supabase',
    url: `${BASE_PATH}`,
    images: `${BASE_PATH}/img/supabase-og-image.png`,
    publishedTime: buildDate,
    modifiedTime: buildDate,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@supabase',
    creator: '@supabase',
    images: `${BASE_PATH}/img/supabase-og-image.png`,
  },
}

export const viewport: Viewport = {
  themeColor: '#1E1E1E',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
