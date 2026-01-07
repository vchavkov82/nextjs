// @ts-check
import configureBundleAnalyzer from '@next/bundle-analyzer'
import nextMdx from '@next/mdx'
import withYaml from 'next-plugin-yaml'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { parse as parseToml } from 'smol-toml'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import webpack from 'next/dist/compiled/webpack/webpack-lib.js'
import remotePatterns from './lib/remotePatterns.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const withBundleAnalyzer = configureBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withMDX = nextMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
    providerImportSource: '@mdx-js/react',
  },
})

/** @type {import('next').NextConfig} nextConfig */
const nextConfig = {
  assetPrefix: getAssetPrefix(),
  // Append the default value with md extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // reactStrictMode: true,
  // swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/docs',
  images: {
    dangerouslyAllowSVG: false,
    // @ts-ignore
    remotePatterns,
  },
  // Webpack config - Required for production builds (webpack is still the default for production)
  // Turbopack config below handles the same file types for development (with --turbopack flag)
  // In Next.js 16+, you can use `next build --turbopack` to use Turbopack for production builds
  webpack: (config) => {
    config.module.rules.push({
      test: /\.include$/,
      type: 'asset/source',
    })
    config.module.rules.push({
      test: /\.toml$/,
      type: 'json',
      parser: {
        parse: parseToml,
      },
    })
    // Exclude build scripts from bundling (they use Node.js-only modules like 'fs')
    // These are only meant to run at build time via Makefile, not in the browser
    // Replace .cts files with empty modules to prevent webpack from trying to bundle them
    const emptyModulePath = resolve(__dirname, 'webpack-loaders/empty-module.js')
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /.*spec[\\/]sections[\\/].*\.cts$/,
        (resource) => {
          resource.request = emptyModulePath
        }
      )
    )
    return config
  },
  transpilePackages: [
    'ui',
    'ui-patterns',
    'common',
    'dayjs',
    'shared-data',
    'api-types',
    'icons',
    'next-mdx-remote',
  ],
  outputFileTracingIncludes: {
    '/api/crawlers': ['./features/docs/generated/**/*', './docs/ref/**/*'],
    '/guides/**/*': ['./content/guides/**/*', './content/troubleshooting/**/*', './examples/**/*'],
    '/reference/**/*': ['./features/docs/generated/**/*', './docs/ref/**/*'],
  },
  serverExternalPackages: ['libpg-query', 'twoslash'],
  // Turbopack config (moved from experimental.turbo to fix deprecation warning)
  turbopack: {
    rules: {
      '*.include': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.toml': {
        loaders: ['toml-loader'],
        as: '*.json',
      },
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      // Exclude build scripts (.cts files) from Turbopack bundling
      // These files use Node.js-only modules like 'fs' and should not be bundled
      // Webpack handles this via NormalModuleReplacementPlugin, but Turbopack needs a loader
      // Return empty content to prevent bundling errors
      'spec/sections/*.cts': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  experimental: {
    // Optimize for high-core systems
    optimizePackageImports: ['ui', 'ui-patterns', 'lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-collapsible'],
    // Enable faster refresh
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: process.env.VERCEL === '1' ? 'max-age=31536000; includeSubDomains; preload' : '',
          },
          {
            key: 'X-Robots-Tag',
            value: 'all',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
        has: [
          {
            type: 'host',
            value: 'supabase.com',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: process.env.VERCEL === '1' ? 'max-age=31536000; includeSubDomains; preload' : '',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
        has: [
          {
            type: 'host',
            value: '(?:.+\\.vercel\\.app)',
          },
        ],
      },
      {
        source: '/favicon/:slug*',
        headers: [{ key: 'cache-control', value: 'public, max-age=86400' }],
      },
    ]
  },

  /**
   * Doc rewrites and redirects are
   * handled by the `www` nextjs config:
   *
   * ./apps/www/lib/redirects.js
   *
   * Only add dev/preview specific redirects
   * in this config.
   */
  async redirects() {
    return [
      // Redirect root to docs base path in dev/preview envs
      {
        source: '/',
        destination: '/docs',
        basePath: false,
        permanent: false,
      },

      // Redirect dashboard links in dev/preview envs
      {
        source: '/dashboard/:path*',
        destination: 'https://supabase.com/dashboard/:path*',
        basePath: false,
        permanent: false,
      },

      // Redirect blog links in dev/preview envs
      {
        source: '/blog/:path*',
        destination: 'https://supabase.com/blog/:path*',
        basePath: false,
        permanent: false,
      },
    ]
  },
  typescript: {
    // On previews, typechecking is run via GitHub Action only for efficiency
    // On production, we turn it on to prevent errors from conflicting PRs getting into
    // prod
    ignoreBuildErrors: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? false : true,
  },
}

const configExport = () => {
  const plugins = [withMDX, withYaml, withBundleAnalyzer]
  // @ts-ignore
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

  // @ts-ignore
  return `https://frontend-assets.supabase.com/${process.env.SITE_NAME}/${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 12)}`
}
