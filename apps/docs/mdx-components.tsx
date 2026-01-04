import type { MDXComponents } from 'mdx/types'
import { components } from '~/features/docs/MdxBase.shared'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components
}
