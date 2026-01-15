import { MDXRemoteBase } from '~/features/docs/MdxBase'
import { SerializeOptions } from '~/types/next-mdx-remote-serialize'

interface GuideArticleProps {
  content?: string
  mdxOptions?: SerializeOptions
}

export function GuideMdxContent({ content, mdxOptions }: GuideArticleProps) {
  // Check if content exists and is not empty (not just truthy check)
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return null
  }
  return <MDXRemoteBase source={content} />
}
