import { withContentlayer } from 'next-contentlayer2'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ui', 'common', 'shared-data', 'icons', 'tsconfig'],
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  async redirects() {
    return [
      ...(process.env.NEXT_PUBLIC_BASE_PATH?.length
        ? [
            {
              source: '/',
              destination: process.env.NEXT_PUBLIC_BASE_PATH,
              basePath: false,
              permanent: false,
            },
          ]
        : []),
    ]
  },
  // Add empty turbopack config to silence webpack config warning when using withContentlayer
  turbopack: {},
  webpack: (config) => {
    // Mock Supabase imports to avoid dependency issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/supabase-js': resolve(__dirname, '../../packages/common/src/supabase-mock.ts'),
    }
    return config
  },
}

export default withContentlayer(nextConfig)
