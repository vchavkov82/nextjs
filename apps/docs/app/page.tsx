import { type Metadata, type ResolvingMetadata } from 'next'

import HomeLayout from '~/layouts/HomeLayout'
import { BASE_PATH } from '~/lib/constants'
import { HomePageContent } from './page.client'

const generateMetadata = async (_, parent: ResolvingMetadata): Promise<Metadata> => {
  const parentAlternates = (await parent).alternates

  return {
    alternates: {
      canonical: `${BASE_PATH}`,
      ...(parentAlternates && {
        languages: parentAlternates.languages || undefined,
        media: parentAlternates.media || undefined,
        types: parentAlternates.types || undefined,
      }),
    },
  }
}

const products = [
  {
    title: 'Database',
    icon: 'database',
    hasLightIcon: true,
    href: '/guides/database/overview',
    description:
      'BA provides a full Postgres database for every project with Realtime functionality, database backups, extensions, and more.',
    span: 'col-span-12 md:col-span-6',
  },
  {
    title: 'Auth',
    icon: 'auth',
    hasLightIcon: true,
    href: '/guides/auth',
    description:
      'Add and manage email and password, passwordless, OAuth, and mobile logins to your project through a suite of identity providers and APIs.',
    span: 'col-span-12 md:col-span-6',
  },
  {
    title: 'Storage',
    icon: 'storage',
    hasLightIcon: true,
    href: '/guides/storage',
    description:
      'Store, organize, transform, and serve large files—fully integrated with your Postgres database with Row Level Security access policies.',
  },
  {
    title: 'Realtime',
    icon: 'realtime',
    hasLightIcon: true,
    href: '/guides/realtime',
    description:
      'Listen to database changes, store and sync user states across clients, broadcast data to clients subscribed to a channel, and more.',
  },
  {
    title: 'Edge Functions',
    icon: 'edge-functions',
    hasLightIcon: true,
    href: '/guides/functions',
    description:
      'Globally distributed, server-side functions to execute your code closest to your users for the lowest latency.',
  },
]

const postgresIntegrations = [
  {
    title: 'AI & Vectors',
    icon: 'ai',
    href: '/guides/ai',
    description: 'AI toolkit to manage embeddings',
  },
  {
    title: 'Cron',
    icon: 'cron',
    href: '/guides/cron',
    description: 'Schedule and monitor recurring Jobs',
  },
  {
    title: 'Queues',
    icon: 'queues',
    href: '/guides/queues',
    description: 'Durable Message Queues with guaranteed delivery',
  },
]

const selfHostingOptions = [
  {
    title: 'Auth',
    icon: 'auth',
    href: '/reference/self-hosting-auth/introduction',
  },
  {
    title: 'Realtime',
    icon: 'realtime',
    href: '/reference/self-hosting-realtime/introduction',
  },
  {
    title: 'Storage',
    icon: 'storage',
    href: '/reference/self-hosting-storage/introduction',
  },
  {
    title: 'Analytics',
    icon: 'analytics',
    href: '/reference/self-hosting-analytics/introduction',
  },
]

const additionalResources = [
  {
    title: 'Management API',
    description: 'Manage your BA projects and organizations.',
    icon: 'reference-api',
    href: '/reference/api/introduction',
  },
  {
    title: 'BA CLI',
    description: 'Use the CLI to develop, manage and deploy your projects.',
    icon: 'reference-cli',
    href: '/reference/cli/introduction',
  },
  {
    title: 'Platform Guides',
    description: 'Learn more about the tools and services powering BA.',
    icon: 'platform',
    href: '/guides/platform',
  },
  {
    title: 'Integrations',
    description: 'Explore a variety of integrations from BA partners.',
    icon: 'integrations',
    href: '/guides/integrations',
  },
  {
    title: 'BA UI',
    description: 'A collection of pre-built BA components to speed up your project.',
    icon: 'ui',
    href: 'https://www.assistance.bg/ui',
    external: true,
  },
  {
    title: 'Troubleshooting',
    description: 'Our troubleshooting guide for solutions to common BA issues.',
    icon: 'troubleshooting',
    href: '/guides/troubleshooting',
  },
]

const HomePage = () => (
  <HomeLayout>
    <HomePageContent
      products={products}
      postgresIntegrations={postgresIntegrations}
      selfHostingOptions={selfHostingOptions}
      additionalResources={additionalResources}
    />
  </HomeLayout>
)

export default HomePage
export { generateMetadata }

