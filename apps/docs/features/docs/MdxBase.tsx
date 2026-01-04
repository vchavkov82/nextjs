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
          console.error('Error resolving feature flag:', feature, error)
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
    const { content: MDXContent } = await compileMDX({
      source: resolvedSource,
      components: mergedComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [[remarkMath, { singleDollarTextMath: false }], remarkGfm],
          rehypePlugins: [rehypeKatex],
        },
      } as any,
    })

    // Render the MDX content as JSX to avoid passing module objects
    return <>{MDXContent}</>  
  } catch (error) {
    console.error('Error rendering MDX:', error)
    throw error
  }
}

export { MDXRemoteBase }
