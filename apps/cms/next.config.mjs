import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  webpack: (config, { webpack, isServer }) => {
    // Ignore test files and other non-production files from node_modules
    config.plugins = config.plugins || []
    const emptyModulePath = path.resolve(__dirname, 'src/empty-module.js')
    
    // Configure resolve aliases to redirect problematic imports
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['tap'] = emptyModulePath
    config.resolve.alias['desm'] = emptyModulePath
    
    // Use NormalModuleReplacementPlugin to replace problematic imports from thread-stream test files
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream[\\/].*[\\/]test[\\/].*\.(js|ts|mjs)$/,
        emptyModulePath
      )
    )
    
    // Also replace any require/import of files in test directories
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]test[\\/].*\.(test|spec)\.(js|ts|mjs)$/,
        emptyModulePath
      )
    )
    
    // Ignore test files using IgnorePlugin
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(test|spec)\.(js|ts|mjs|cjs|tsx|jsx)$/,
        contextRegExp: /node_modules/,
      })
    )
    
    // Ignore test dependencies completely (they should never be in production builds)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(tap|desm)$/,
      })
    )
    
    // Ignore files in test directories
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          if (!context || !context.includes('node_modules')) {
            return false
          }
          // Ignore files in test directories
          if (resource.includes('/test/') || resource.includes('\\test\\')) {
            return true
          }
          return false
        },
      })
    )
    
    return config
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
