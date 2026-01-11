import { withPayload } from '@payloadcms/next/withPayload'
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)
const webpack = require('webpack')

const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const redirects = [internetExplorerRedirect]

  return redirects
}

const WWW_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://www.assistance.bg'
    : process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL &&
        typeof process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL === 'string'
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL.replace('cms-git-', 'zone-www-dot-com-git-')}`
      : 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[WWW_SITE_ORIGIN /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol?.replace(':', ''),
        }
      }),
    ],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  redirects,
  // Configure Sharp as an external package for server-side rendering
  serverExternalPackages: ['sharp'],
  // Exclude test files from being traced into serverless functions
  outputFileTracingExcludes: {
    '*': [
      '**/node_modules/**/test/**',
      '**/node_modules/**/tests/**',
      '**/node_modules/**/*.test.js',
      '**/node_modules/**/*.test.ts',
      '**/node_modules/thread-stream/test/**',
      '**/node_modules/pino/**/test/**',
    ],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  experimental: {
    // Optimize for high-core systems
    optimizePackageImports: ['@payloadcms/ui', '@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-select', 'lucide-react'],
    // Enable faster refresh
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore test files and test dependencies
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore test files in node_modules
          if (context.includes('node_modules')) {
            // Check if resource is a test file path
            if (
              resource.includes('/test/') ||
              resource.includes('/tests/') ||
              resource.endsWith('.test.js') ||
              resource.endsWith('.test.ts') ||
              resource.endsWith('.test.mjs')
            ) {
              return true
            }
          }
          
          // Ignore test dependencies
          const testPackages = ['tap', 'desm', 'fastbench', 'pino-elasticsearch']
          if (testPackages.includes(resource)) {
            return true
          }
          
          return false
        },
      })
    )
    
    // Also use NormalModuleReplacementPlugin as a fallback for thread-stream test files
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream[\/\\]test[\/\\].*$/,
        (resource) => {
          // Replace test files with empty module
          resource.request = path.join(process.cwd(), 'apps/cms/empty-module.js')
        }
      )
    )

    return config
  },
  // Configure server to listen on all interfaces for remote access
  server: {
    host: '0.0.0.0',
    port: 3030,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
