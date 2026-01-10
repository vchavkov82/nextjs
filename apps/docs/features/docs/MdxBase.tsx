import matter from 'gray-matter'
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
    
    // Note: StepHikeCompact component property access transformation is now handled
    // in the preprocessing step (see preprocessMdx in features/directives/utils.ts)

    // Strip frontmatter manually to avoid getData error in next-mdx-remote v5.0.0
    // Even with parseFrontmatter: false, compileMDX may still try to access getData
    // if frontmatter is present in the source
    const { content: sourceWithoutFrontmatter } = matter(resolvedSource)

    const mergedComponents = {
      ...components,
      ...customComponents,
    }

    // Use compileMDX with parseFrontmatter: false to avoid getData issue
    // The getData error occurs when parseFrontmatter is true or when accessing frontmatter
    // By setting parseFrontmatter to false, we avoid the problematic code path
    // Note: For compileMDX from /rsc, parseFrontmatter and mdxOptions are at the top level
    const { content } = await compileMDX({
      source: sourceWithoutFrontmatter,
      components: mergedComponents,
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [
          [remarkMath, { singleDollarTextMath: false }],
          remarkGfm,
        ],
        rehypePlugins: [rehypeKatex],
        format: 'mdx',
      },
    })

    // Return the MDX content directly
    return content
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error rendering MDX:', error)
    }
    throw error
  }
}

export { MDXRemoteBase }
