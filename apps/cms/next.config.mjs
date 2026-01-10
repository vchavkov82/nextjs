import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'
import { withPayload } from '@payloadcms/next/withPayload'
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)
const webpack = require('webpack')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const requireModule = createRequire(import.meta.url)
const emptyModulePath = resolve(__dirname, 'webpack-loaders/empty-module.js')
const payloadStubPath = resolve(__dirname, 'webpack-loaders/payload-stub.js')

// Resolve problematic package paths at module load time (ESM compatible)
let hoistNonReactStaticsPath
let memoizeOnePath
try {
  hoistNonReactStaticsPath = requireModule.resolve('hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js')
} catch (e) {
  // Fallback if resolve fails
  hoistNonReactStaticsPath = null
}
try {
  memoizeOnePath = requireModule.resolve('memoize-one/dist/memoize-one.esm.js')
} catch (e) {
  // Fallback if resolve fails
  memoizeOnePath = null
}

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
  // Also externalize thread-stream to avoid Turbopack trying to trace worker_threads
  serverExternalPackages: ['sharp', 'pino', 'thread-stream', '@esbuild/linux-x64', 'esbuild'],
  webpack: (config) => {
    // Handle worker_threads (Node.js built-in module)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'worker_threads': false,
    }
    
    // Configure webpack to properly resolve ESM exports from payload
    // The functions exist but webpack might not be resolving them correctly
    config.resolve.conditionNames = ['import', 'require', 'node', 'default']
    
    // Use 'exports' field but handle invalid exports gracefully
    // This is needed for @payloadcms/next package exports like ./views, ./css, ./routes
    config.resolve.exportsFields = ['exports', 'module', 'main']
    
    // Use NormalModuleReplacementPlugin to replace problematic imports
    // These packages have invalid exports fields, so we bypass them by using direct file paths
    if (hoistNonReactStaticsPath) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^hoist-non-react-statics$/,
          (resource) => {
            // Check if this is from @emotion/react which has the export issue
            if (resource.context && resource.context.includes('@emotion/react')) {
              resource.request = hoistNonReactStaticsPath
            }
          }
        )
      )
    }
    
    if (memoizeOnePath) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^memoize-one$/,
          (resource) => {
            // Check if this is from react-select which has the export issue  
            if (resource.context && resource.context.includes('react-select')) {
              resource.request = memoizeOnePath
            }
          }
        )
      )
    }
    
    
    // Replace test files with empty module to prevent bundling errors
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /thread-stream[\\/]test[\\/]/,
        emptyModulePath
      )
    )
    // Replace test files in general
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\.test\.(js|ts|mjs)$/,
        emptyModulePath
      )
    )
    // Replace spec files
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\.spec\.(js|ts|mjs)$/,
        emptyModulePath
      )
    )
    // Ignore test files from thread-stream package
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore any file in a test directory within thread-stream
          if (context.includes('thread-stream') && resource.includes('/test/')) {
            return true
          }
          // Ignore test files
          if (resource.includes('.test.') || resource.includes('.spec.')) {
            return true
          }
          // Ignore non-source files
          if (
            resource.match(/\.(md|yml|yaml|zip|sh|LICENSE|CHANGELOG)$/) ||
            resource.includes('/README') ||
            resource.includes('/bin/')
          ) {
            return true
          }
          return false
        },
      })
    )
    return config
  },
  outputFileTracingExcludes: {
    '*': [
      // Exclude test directories from being traced
      '**/node_modules/**/test/**',
      '**/node_modules/**/*.test.*',
      '**/node_modules/**/*.spec.*',
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
    resolveAlias: {
      // Alias test files to empty module to prevent Turbopack from processing them
      'thread-stream/test': './webpack-loaders/empty-module.js',
      'thread-stream/test/**': './webpack-loaders/empty-module.js',
      'thread-stream/**/test/**': './webpack-loaders/empty-module.js',
      // Alias esbuild binary to empty module to prevent Turbopack from processing it
      '@esbuild/linux-x64/bin/esbuild': './webpack-loaders/empty-module.js',
      '@esbuild/linux-x64/bin/esbuild.js': './webpack-loaders/empty-module.js',
      // Exclude worker_threads from Turbopack processing (built-in Node.js module)
      'worker_threads': './webpack-loaders/empty-module.js',
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      // Exclude test files from being processed by Turbopack
      '**/test/**': {
        loaders: [],
        as: '*.js',
      },
      '**/*.test.*': {
        loaders: [],
        as: '*.js',
      },
      '**/*.spec.*': {
        loaders: [],
        as: '*.js',
      },
      // Handle non-source files
      '**/README.*': {
        loaders: [],
        as: '*.js',
      },
      '**/LICENSE*': {
        loaders: [],
        as: '*.js',
      },
      // Exclude binary files
      '**/bin/**': {
        loaders: [],
        as: '*.js',
      },
      // Exclude esbuild binary files - use resolveAlias instead of loaders
      '**/@esbuild/**/bin/esbuild': {
        loaders: [],
        as: '*.js',
      },
      '**/@esbuild/**/bin/esbuild.js': {
        loaders: [],
        as: '*.js',
      },
      // Exclude non-JS files that shouldn't be processed
      '**/*.zip': {
        loaders: [],
        as: '*.js',
      },
      '**/*.sh': {
        loaders: [],
        as: '*.js',
      },
      '**/*.yml': {
        loaders: [],
        as: '*.js',
      },
    },
  },
>>>>>>> e96dd94191 (Update dependencies in pnpm-lock.yaml and enhance Next.js configuration)
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
