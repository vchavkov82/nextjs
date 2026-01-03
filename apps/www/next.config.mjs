import bundleAnalyzer from '@next/bundle-analyzer'
import nextMdx from '@next/mdx'

import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import redirects from './lib/redirects.js'
import remotePatterns from './lib/remotePatterns.js'
import rewrites from './lib/rewrites.js'

import { remarkCodeHike } from '@code-hike/mdx'
import codeHikeTheme from 'config/code-hike.theme.json' with { type: 'json' }

const withMDX = nextMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      [
        remarkCodeHike,
        {
          theme: codeHikeTheme,
          lineNumbers: true,
          showCopyButton: true,
        },
      ],
      remarkGfm,
    ],
    rehypePlugins: [rehypeSlug],
    // This is required for `MDXProvider` component
    providerImportSource: '@mdx-js/react',
  },
})

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  basePath: '',
  assetPrefix: getAssetPrefix(),
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  trailingSlash: false,
  transpilePackages: [
    'ui',
    'ui-patterns',
    'common',
    'shared-data',
    'icons',
    'api-types',
    // needed to make the octokit packages work in /changelog
    '@octokit/plugin-paginate-graphql',
  ],
  experimental: {
    // needed to make the octokit packages work in /changelog
  },
  /**
   * Exclude huge directories from being traced into serverless functions
   * to avoid the max size limit for Serverless Functions on Vercel:
   * https://vercel.com/guides/troubleshooting-function-250mb-limit
   */
  outputFileTracingExcludes: {
    '*': [
      // Next.js build artifacts
      '.next/cache/**/*',
      '.next/static/**/*',
      // Static assets
      'public/**/*',
    ],
  },
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns,
    qualities: [75, 100],
  },
  async headers() {
    return [
      // Allow CMS preview iframe embedding by omitting X-Frame-Options for blog routes
      {
        source: '/blog/:slug*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all',
          },
          // No X-Frame-Options header to allow iframe embedding
        ],
      },
      {
        source: '/api-v2/cms/preview',
        headers: [
          {
            key: 'content-type',
            value: 'text/html',
          },
          // No X-Frame-Options header to allow iframe embedding
        ],
      },
      // Default X-Frame-Options for all other paths
      {
        source: '/((?!blog|api-v2/cms/preview).*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        source: '/.well-known/vercel/flags',
        headers: [
          {
            key: 'content-type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/favicon/:slug*',
        headers: [{ key: 'cache-control', value: 'public, max-age=86400' }],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value:
              process.env.NEXT_PUBLIC_IS_PLATFORM === 'true' && process.env.VERCEL === '1'
                ? 'max-age=31536000; includeSubDomains; preload'
                : '',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return rewrites
  },
  async redirects() {
    return redirects
  },
  typescript: {
    // On previews, typechecking is run via GitHub Action only for efficiency
    // On production, we turn it on to prevent errors from conflicting PRs getting into
    // prod
    ignoreBuildErrors: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? false : true,
  },
  eslint: {
    // We are already running linting via GH action, this will skip linting during production build on Vercel.
    ignoreDuringBuilds: true,
  },
}

// next.config.js.
const configExport = () => {
  const plugins = [withMDX, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), nextConfig)
}

export default configExport()

function getAssetPrefix() {
  // If not force enabled, but not production env, disable CDN
  if (process.env.FORCE_ASSET_CDN !== '1' && process.env.VERCEL_ENV !== 'production') {
    return undefined
  }

  // Force disable CDN
  if (process.env.FORCE_ASSET_CDN === '-1') {
    return undefined
  }

  return `https://frontend-assets.supabase.com/${process.env.SITE_NAME}/${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 12)}`
}
