import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { isFeatureEnabled } from 'common/enabled-features'
import { preprocessMdxWithDefaults } from '~/features/directives/utils'
import { components } from '~/features/docs/MdxBase.shared'
import { SerializeOptions } from '~/types/next-mdx-remote-serialize'

interface MDXRemoteBaseProps {
  source: string
  options?: SerializeOptions
  customPreprocess?: (mdx: string) => string | Promise<string>
  components?: Record<string, React.ComponentType<any>>
}

const mdxOptions: SerializeOptions = {
  mdxOptions: {
    useDynamicImport: true,
    remarkPlugins: [[remarkMath, { singleDollarTextMath: false }], remarkGfm],
    rehypePlugins: [rehypeKatex],
  },
}

const MDXRemoteBase = async ({
  source,
  options = {},
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

    const { mdxOptions: { remarkPlugins, rehypePlugins, ...otherMdxOptions } = {}, ...otherOptions } =
      options
    const {
      mdxOptions: {
        remarkPlugins: originalRemarkPlugins,
        rehypePlugins: originalRehypePlugins,
        ...originalMdxOptions
      } = {},
    } = mdxOptions

    const finalOptions: SerializeOptions = {
      ...mdxOptions,
      ...otherOptions,
      mdxOptions: {
        ...originalMdxOptions,
        ...otherMdxOptions,
        remarkPlugins: [...(originalRemarkPlugins ?? []), ...(remarkPlugins ?? [])],
        rehypePlugins: [...(originalRehypePlugins ?? []), ...(rehypePlugins ?? [])],
      },
    }

    const mergedComponents = {
      ...components,
      ...customComponents,
    }

    return (
      <MDXRemote
        source={resolvedSource}
        components={mergedComponents}
        options={finalOptions}
      />
    )
  } catch (error) {
    console.error('Error rendering MDX:', error)
    throw error
  }
}

export { MDXRemoteBase }
