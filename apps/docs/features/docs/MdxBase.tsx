import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { isFeatureEnabled } from 'common/enabled-features'
import { preprocessMdxWithDefaults } from '~/features/directives/utils'
import { components } from '~/features/docs/MdxBase.shared'

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
    // gray-matter should be robust enough to handle all frontmatter.
    // The complex logic in stripAllFrontmatter was likely causing issues.
    const { content: rawContent } = matter(source, { excerpt: false })

    const preprocess = customPreprocess ?? preprocessMdxWithDefaults
    const preprocessedSource = await preprocess(rawContent)

    const resolvedSource = preprocessedSource.replace(
      /isFeatureEnabled\(['"]([^'"]+)['"]\)/g,
      (match, feature) => {
        try {
          return String(isFeatureEnabled(feature as any))
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error resolving feature flag:', feature, error)
          }
          return 'false'
        }
      }
    )

    if (!resolvedSource || resolvedSource.trim().length === 0) {
      throw new Error('MDX source is empty after processing')
    }

    const mergedComponents = { ...components, ...customComponents }

    const result = await compileMDX({
      source: resolvedSource,
      components: mergedComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [
            [remarkMath, { singleDollarTextMath: false }],
            [remarkGfm as any],
          ],
          rehypePlugins: [rehypeKatex],
        },
      },
    })

    return result.content
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error('MDX compilation error:', {
        message: errorMsg,
        stack: errorStack,
        sourcePreview: source.substring(0, 300),
      })
    }
    throw error
  }
}

export { MDXRemoteBase }
