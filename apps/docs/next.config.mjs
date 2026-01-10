// @ts-check
import configureBundleAnalyzer from '@next/bundle-analyzer'
import nextMdx from '@next/mdx'
import withYaml from 'next-plugin-yaml'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { parse as parseToml } from 'smol-toml'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'
import webpack from 'next/dist/compiled/webpack/webpack-lib.js'
import remotePatterns from './lib/remotePatterns.js'

const require = createRequire(import.meta.url)
// Use module ID instead of absolute path to avoid server-relative imports
const wasmPath = 'libpg-query/wasm'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to empty module used to replace build-time scripts that shouldn't be bundled
const emptyModulePath = resolve(__dirname, 'webpack-loaders/empty-module.js')

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
  webpack: (config, { isServer }) => {
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

    // Alias libpg-query to its WASM version for both client and server bundles
    // The native version contains .node files which are missing or cannot be bundled
    config.resolve.alias = {
      ...config.resolve.alias,
      'libpg-query$': wasmPath,
    }

    // On the server, we can't load the native libpg-query module.
    // Since SqlToRest is dynamically imported with ssr: false, 
    // we can safely alias it to an empty module on the server.
    if (isServer) {
      config.resolve.alias['libpg-query'] = emptyModulePath
      config.resolve.alias['libpg-query$'] = emptyModulePath
      config.resolve.alias['@supabase/sql-to-rest'] = emptyModulePath
    }

    // Force replacement of libpg-query native module with WASM version
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/libpg-query([\\/])index\.js$/, (resource) => {
        resource.request = wasmPath
      })
    )

    // Replace any .node file requests with an empty module to prevent bundling errors
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/\.node$/, emptyModulePath)
    )

    // Exclude build scripts from bundling (they use Node.js-only modules like 'fs')
    // These are only meant to run at build time via Makefile, not in the browser
    // Replace .cts files with empty modules to prevent webpack from trying to bundle them
    
    // Use NormalModuleReplacementPlugin to replace .cts files with empty module
    // This runs during module resolution and replaces .cts files before webpack tries to parse them
    // Updated regex to handle both forward and back slashes, and various path formats
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\.cts(\.js)?$/,
        (resource) => {
          resource.request = emptyModulePath
        }
      )
    )
    
    // More specific replacement for spec/sections directory
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /.*[\/\\]spec[\/\\]sections[\/\\].*\.cts(\.js)?$/,
        (resource) => {
          resource.request = emptyModulePath
        }
      )
    )
    
    // Replace Makefile with empty module to prevent webpack from trying to parse it
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /.*[\/\\]spec[\/\\]Makefile$/,
        (resource) => {
          resource.request = emptyModulePath
        }
      )
    )
    
    // Ignore all .cts files to prevent any accidental imports
    // This is a fallback in case NormalModuleReplacementPlugin doesn't catch them
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.cts(\.js)?$/,
        contextRegExp: /.*/,
      })
    )
    
    // Ignore .cts files in spec/sections directory using IgnorePlugin
    // This is a more specific rule for the build scripts directory
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /spec[\/\\]sections[\/\\].*\.cts(\.js)?$/,
      })
    )
    
    // Ignore .md files in spec directory (README files that shouldn't be bundled)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /spec[\/\\].*\.md$/,
      })
    )
    
    // Ignore .yaml/.yml files in spec directory (build-time spec files that shouldn't be bundled)
    // Note: next-plugin-yaml handles YAML imports in the app, but we don't want to bundle spec files
    // Ignore third-party spec YAML outside of the docs app so docs imports still resolve.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /spec[\/\\].*\.ya?ml$/,
        contextRegExp: /^(?!.*[\\/]apps[\\/]docs).*$/,
      })
    )
    
    // Ignore Makefile in spec directory (build-time file that shouldn't be bundled)
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /spec[\/\\].*Makefile$/,
      })
    )
    // Also ignore Makefile without extension
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /spec[\/\\]Makefile$/,
      })
    )
    
    // Add resolve alias for .cts files to work with both webpack and turbopack
    // Handle various import path formats
    config.resolve.alias = {
      ...config.resolve.alias,
      'spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      'spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      './spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      './spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      '../spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      '../spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      '~/spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      '~/spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      // Ignore Makefile via alias
      '~/spec/Makefile': emptyModulePath,
      'spec/Makefile': emptyModulePath,
      // Add alias for ~/spec/ to enable dynamic imports from spec directory
      '~/spec': resolve(__dirname, 'spec'),
      // Add general ~ alias to match tsconfig.json paths configuration
      '~': resolve(__dirname),
    }
    
    // Remove .cts from resolve extensions to prevent webpack from trying to resolve them
    if (config.resolve.extensions) {
      config.resolve.extensions = config.resolve.extensions.filter((ext) => ext !== '.cts')
    }
    
    // Mark Node.js built-in modules as external to prevent bundling errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }
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
    '@code-hike/mdx',
  ],
  outputFileTracingIncludes: {
    '/api/crawlers': ['./features/docs/generated/**/*', './docs/ref/**/*'],
    '/guides/**/*': ['./content/guides/**/*', './content/troubleshooting/**/*', './examples/**/*'],
    '/reference/**/*': ['./features/docs/generated/**/*', './docs/ref/**/*'],
  },
  serverExternalPackages: [
    'twoslash',
    '@octokit/auth-app',
    '@octokit/core',
    '@octokit/graphql',
    '@octokit/request',
    '@octokit/request-error',
    'universal-github-app-jwt',
    'libpg-query',
    '@supabase/sql-to-rest',
  ],
  experimental: {
    // Optimize for high-core systems
    optimizePackageImports: ['ui', 'ui-patterns', 'lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-collapsible'],
    // Enable faster refresh
    optimizeCss: true,
    // Allow cross-origin requests from development origins
    allowedDevOrigins: ['suse-10.lan.assistance.bg'],
  },
  // Turbopack configuration - handles file types that webpack config above handles
  // Note: @next/mdx handles .md/.mdx files for pages, but we need to handle non-page markdown imports
  // Note: next-plugin-yaml handles YAML files for webpack, but Turbopack needs explicit rules
  turbopack: {
    resolveAlias: {
      'libpg-query': wasmPath,
      'spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      'spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      './spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      './spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      '../spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      '../spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      '~/spec/sections/generateMgmtApiSections.cts': emptyModulePath,
      '~/spec/sections/generateMgmtApiSections.cts.js': emptyModulePath,
      // Ignore Makefile via alias
      '~/spec/Makefile': emptyModulePath,
      'spec/Makefile': emptyModulePath,
      // Add general ~ alias to match tsconfig.json paths configuration
      '~': resolve(__dirname),
    },
    rules: {
      // Handle .md files with raw-loader (for non-page markdown imports)
      // This prevents "Unknown module type" errors when Turbopack encounters .md files
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      // Handle .yaml/.yml files - treat as JSON since YAML can be parsed as JSON
      // This prevents "Unknown module type" errors when Turbopack encounters YAML files
      '*.yaml': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.yml': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      // Handle .toml files with raw-loader
      // This prevents "Unknown module type" errors when Turbopack encounters .toml files
      '*.toml': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      // Handle .include files with raw-loader (for source file imports)
      // This prevents "Unknown module type" errors when Turbopack encounters .include files
      '*.include': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      // Exclude .cts files (build-time scripts) from Turbopack bundling
      // These files use Node.js-only modules like 'fs' and should not be bundled
      '*.cts': {
        loaders: [],
        as: '*.js',
      },
      // Also exclude .cts.js (some resolvers append .js)
      '*.cts.js': {
        loaders: [],
        as: '*.js',
      },
      // Specifically exclude .cts files in spec/sections directory
      'spec/sections/*.cts': {
        loaders: [],
        as: '*.js',
      },
      'spec/sections/*.cts.js': {
        loaders: [],
        as: '*.js',
      },
      // Exclude Makefile in spec directory (build-time file that shouldn't be bundled)
      'spec/*Makefile': {
        loaders: [],
        as: '*.js',
      },
      'spec/Makefile': {
        loaders: [],
        as: '*.js',
      },
    },
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
            value: 'www.assistance.bg',
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
        destination: 'https://www.assistance.bg/dashboard/:path*',
        basePath: false,
        permanent: false,
      },

      // Redirect blog links in dev/preview envs
      {
        source: '/blog/:path*',
        destination: 'https://www.assistance.bg/blog/:path*',
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
  // Apply plugins
  // @ts-ignore
  const config = plugins.reduce((acc, next) => next(acc), nextConfig)

  // Next.js no longer accepts experimental.turbo; ensure it stays top-level as `turbopack`
  if (config.experimental?.turbo) {
    delete config.experimental.turbo
  }

  return config
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
  return `https://frontend-assets.www.assistance.bg/${process.env.SITE_NAME}/${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 12)}`
}
