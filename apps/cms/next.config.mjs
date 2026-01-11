import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'
import { withPayload } from '@payloadcms/next/withPayload'
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

    // Add aliases for packages with broken exports
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-is': requireModule.resolve('react-is/index.js'),
      'nodemailer': requireModule.resolve('nodemailer/lib/nodemailer.js'),
      'strnum': requireModule.resolve('strnum/strnum.js'),
      'react-transition-group': requireModule.resolve('react-transition-group/esm/index.js'),
      'body-scroll-lock': requireModule.resolve('body-scroll-lock/lib/bodyScrollLock.esm.js'),
      'hoist-non-react-statics': hoistNonReactStaticsPath || requireModule.resolve('hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js'),
      'memoize-one': memoizeOnePath || requireModule.resolve('memoize-one/dist/memoize-one.esm.js'),
      'prop-types': requireModule.resolve('prop-types/index.js'),
      'dom-helpers': requireModule.resolve('dom-helpers'),
      'dom-helpers/addClass': requireModule.resolve('dom-helpers/cjs/addClass.js'),
      'dom-helpers/removeClass': requireModule.resolve('dom-helpers/cjs/removeClass.js'),
      'focus-trap': requireModule.resolve('focus-trap/dist/focus-trap.esm.js'),
      'qs-esm': requireModule.resolve('qs-esm/lib/index.js'),
      '@dnd-kit/core': requireModule.resolve('@dnd-kit/core/dist/core.esm.js'),
      '@dnd-kit/utilities': requireModule.resolve('@dnd-kit/utilities/dist/utilities.esm.js'),
      '@dnd-kit/accessibility': requireModule.resolve('@dnd-kit/accessibility/dist/accessibility.esm.js'),
      '@dnd-kit/modifiers': requireModule.resolve('@dnd-kit/modifiers/dist/modifiers.esm.js'),
      '@dnd-kit/sortable': requireModule.resolve('@dnd-kit/sortable/dist/sortable.esm.js'),
      'tabbable': requireModule.resolve('tabbable/dist/index.esm.js'),
      'bson-objectid': requireModule.resolve('bson-objectid/objectid.js'),
      'object-to-formdata': requireModule.resolve('object-to-formdata/src/index.js'),
      'ajv': requireModule.resolve('ajv/dist/ajv.js'),
      'fast-deep-equal': requireModule.resolve('fast-deep-equal/index.js'),
      'json-schema-traverse': requireModule.resolve('json-schema-traverse/index.js'),
      'fast-uri': requireModule.resolve('fast-uri/index.js'),
      'deepmerge': requireModule.resolve('deepmerge/dist/cjs.js'),
      'pluralize': requireModule.resolve('pluralize/pluralize.js'),
      'prompts': requireModule.resolve('prompts/index.js'),
      'sisteransi': requireModule.resolve('sisteransi/src/index.js'),
      'console-table-printer': requireModule.resolve('console-table-printer/dist/index.js'),
      'simple-wcswidth': requireModule.resolve('simple-wcswidth/dist/index.js'),
      'graphql-playground-html': requireModule.resolve('graphql-playground-html/dist/index.js'),
      'amazon-cognito-identity-js': requireModule.resolve('amazon-cognito-identity-js/es/index.js'),
      'cssfilter': requireModule.resolve('cssfilter/lib/index.js'),
      'scmp': requireModule.resolve('scmp/index.js'),
      'isomorphic-unfetch': requireModule.resolve('isomorphic-unfetch/index.js'),
      'js-cookie': requireModule.resolve('js-cookie/src/js.cookie.js'),
      'dataloader': requireModule.resolve('dataloader/index.js'),
      'sanitize-filename': requireModule.resolve('sanitize-filename/index.js'),
      'node-fetch': requireModule.resolve('node-fetch'),
      'truncate-utf8-bytes': requireModule.resolve('truncate-utf8-bytes'),
      'unfetch': requireModule.resolve('unfetch'),
      'pino': requireModule.resolve('pino/pino.js'),
      'fast-redact': requireModule.resolve('fast-redact'),
      'pino-std-serializers': requireModule.resolve('pino-std-serializers'),
      'quick-format-unescaped': requireModule.resolve('quick-format-unescaped'),
      'sonic-boom': requireModule.resolve('sonic-boom'),
      'whatwg-url': requireModule.resolve('whatwg-url'),
      'webidl-conversions': requireModule.resolve('webidl-conversions/lib/index.js'),
      'tr46': requireModule.resolve('tr46/index.js'),
      'atomic-sleep': requireModule.resolve('atomic-sleep/index.js'),
      'on-exit-leak-free': requireModule.resolve('on-exit-leak-free/index.js'),
      'thread-stream': requireModule.resolve('thread-stream/index.js'),
      'safe-stable-stringify': requireModule.resolve('safe-stable-stringify'),
    }
    
    // Configure webpack to properly resolve ESM exports from payload
    // The functions exist but webpack might not be resolving them correctly
    config.resolve.conditionNames = ['import', 'require', 'node', 'default']
    
    // Custom plugin to handle exports field resolution more gracefully
    // Skip exports field for packages with known invalid exports, use main/module instead
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap('SelectiveExportsPlugin', (nmf) => {
          nmf.hooks.beforeResolve.tap('SelectiveExportsPlugin', (data) => {
            // List of packages with invalid exports that should skip exports field
            const problematicPackages = [
              'react-is',
              'nodemailer',
              'strnum',
              'react-transition-group',
              'body-scroll-lock',
              'hoist-non-react-statics',
              'memoize-one',
              'prop-types',
              'dom-helpers',
              'focus-trap',
              'qs-esm',
              '@dnd-kit/core',
              '@dnd-kit/utilities',
              '@dnd-kit/accessibility',
              '@dnd-kit/modifiers',
              '@dnd-kit/sortable',
              'tabbable',
              'bson-objectid',
              'object-to-formdata',
              'ajv',
              'fast-deep-equal',
              'json-schema-traverse',
              'fast-uri',
              'deepmerge',
              'pluralize',
              'prompts',
              'sisteransi',
              'console-table-printer',
              'simple-wcswidth',
              'graphql-playground-html',
              'path-to-regexp',
              'amazon-cognito-identity-js',
              'cssfilter',
              'scmp',
              'isomorphic-unfetch',
              'js-cookie',
              'dataloader',
              'sanitize-filename',
              'node-fetch',
              'truncate-utf8-bytes',
              'unfetch',
              'pino',
              'fast-redact',
              'pino-std-serializers',
              'quick-format-unescaped',
              'sonic-boom',
              'whatwg-url',
              'webidl-conversions',
              'tr46',
              'atomic-sleep',
              'on-exit-leak-free',
              'thread-stream',
              'safe-stable-stringify',
            ]
            
            // Check if this request is for a problematic package
            const isProblematic = problematicPackages.some(pkg => {
              return data.request === pkg || 
                     data.request?.startsWith(pkg + '/') ||
                     data.context?.includes(`/${pkg}/`)
            })
            
            // Skip exports field for problematic packages
            if (isProblematic && data.resolveOptions) {
              data.resolveOptions.exportsFields = ['module', 'main']
            }
          })
        })
      },
    })
    
    // Default to using exports for all packages (needed for @payloadcms/next)
    // The aliases above will handle specific problematic packages
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

    // Handle dom-helpers sub-path imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^dom-helpers\/addClass$/,
        requireModule.resolve('dom-helpers/cjs/addClass.js')
      )
    )
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^dom-helpers\/removeClass$/,
        requireModule.resolve('dom-helpers/cjs/removeClass.js')
      )
    )
    
    // Handle path-to-regexp with broken exports field
    try {
      const pathToRegexpPath = requireModule.resolve('path-to-regexp')
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^path-to-regexp$/,
          pathToRegexpPath
        )
      )
    } catch (e) {
      // Fallback: try to use the dist path directly
      // This might not work if webpack still validates exports
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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
