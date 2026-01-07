import { withContentlayer } from 'next-contentlayer2'

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
}

export default withContentlayer(nextConfig)
