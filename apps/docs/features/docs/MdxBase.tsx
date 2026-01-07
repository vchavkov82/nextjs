import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { isFeatureEnabled } from 'common/enabled-features'
import { preprocessMdxWithDefaults } from '~/features/directives/utils'
import { components } from '~/features/docs/MdxBase.shared'
import { SerializeOptions } from '~/types/next-mdx-remote-serialize'

interface MDXRemoteBaseProps {
  source: string
  customPreprocess?: (mdx: string) => string | Promise<string>
  components?: Record<string, React.ComponentType<any>>
}

const MDXRemoteBase = async ({
  source,
  customPreprocess,
  components: customComponents,
}: MDXRemoteBaseProps) => {
  try {
    const preprocess = customPreprocess ?? preprocessMdxWithDefaults
    
    // Custom preprocessing to resolve isFeatureEnabled calls
    const resolveFeatureFlags = (mdx: string): string => {
      return mdx.replace(/isFeatureEnabled\(['"]([^'"]+)['"]\)/g, (match, feature) => {
        try {
          const result = isFeatureEnabled(feature as any)
          return String(result)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('Error resolving feature flag:', feature, error)
          }
          return 'false'
        }
      })
    }
    
    const preprocessedSource = await preprocess(source)
    const resolvedSource = resolveFeatureFlags(preprocessedSource)

    const mergedComponents = {
      ...components,
      ...customComponents,
    }

    // Use compileMDX which processes on the server and returns a component
    // Note: There's a known issue with next-mdx-remote v5.0.0 and React 19 where the library
    // tries to access `this.getData()` which doesn't exist in React Server Components context.
    // This is a compatibility issue that requires next-mdx-remote to be updated for React 19 support.
    // Workaround: Ensure we're in a proper React Server Component context when calling compileMDX
    try {
      const { content } = await compileMDX({
        source: resolvedSource,
        components: mergedComponents,
        options: {
          mdxOptions: {
            remarkPlugins: [
              [remarkMath, { singleDollarTextMath: false }],
              remarkGfm,
            ],
            rehypePlugins: [rehypeKatex],
            format: 'mdx',
          },
        },
      })

      // Return the MDX content directly
      return content
    } catch (compileError: unknown) {
      // Enhanced error logging for debugging MDX compilation issues
      if (
        process.env.NODE_ENV === 'development' &&
        compileError instanceof Error &&
        compileError.message?.includes('getData')
      ) {
        // eslint-disable-next-line no-console
        console.error('MDX compilation error (getData issue):', {
          message: compileError.message,
          stack: compileError.stack,
          sourceLength: resolvedSource.length,
          sourcePreview: resolvedSource.substring(0, 200),
        })
      }
      throw compileError
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error rendering MDX:', error)
    }
    throw error
  }
}

export { MDXRemoteBase }
