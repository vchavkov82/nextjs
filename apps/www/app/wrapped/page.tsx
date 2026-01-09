import { Metadata } from 'next'
import WrappedClient from './WrappedClient'

export const metadata: Metadata = {
  title: 'BA Wrapped 2025',
  description:
    'In 2025, developers around the world shipped faster, scaled further, and built things we never imagined. Here is what you accomplished on BA.',
  openGraph: {
    title: 'BA Wrapped 2025',
    description:
      'In 2025, developers around the world shipped faster, scaled further, and built things we never imagined. Here is what you accomplished on BA.',
    url: 'https://www.assistance.bg/wrapped',
    siteName: 'BA',
    images: [
      {
        url: '/images/wrapped/wrapped-og.png',
        width: 1200,
        height: 630,
        alt: 'BA Wrapped 2025',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BA Wrapped 2025',
    description:
      'In 2025, developers around the world shipped faster, scaled further, and built things we never imagined. Here is what you accomplished on BA.',
    images: ['/images/wrapped/wrapped-og.png'],
  },
}

export default function SupabaseWrappedPage() {
  return <WrappedClient />
}
