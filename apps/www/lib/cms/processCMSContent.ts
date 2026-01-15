import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import {
  convertRichTextToMarkdownWithBlocks,
  convertRichTextToMarkdown,
} from './convertRichTextToMarkdown'
import { mdxSerialize } from '@/lib/mdx/mdxSerialize'
// Define minimal block structure for compatibility
type CMSBlock = {
  blockType: string
  [key: string]: any
}

export interface ProcessedCMSContent {
  content: MDXRemoteSerializeResult
  blocks: CMSBlock[]
  toc: { content: string; json: any[] }
  plainMarkdown: string
}

/**
 * Process PayloadCMS rich text content for use in the www blog
 * This function handles both basic content and custom blocks
 */
export async function processCMSContent(
  richTextContent: any,
  tocDepth: number = 3
): Promise<ProcessedCMSContent> {
  try {
    // Convert rich text to markdown with blocks converted to existing www syntax
    const { markdown, blocks } = convertRichTextToMarkdownWithBlocks(richTextContent)

    // Serialize the markdown for MDX (blocks are now converted to existing components)
    // mdxSerialize already collects TOC, so we reuse that instead of generating separately
    const mdxContent = await mdxSerialize(markdown, { tocDepth })

    return {
      content: mdxContent,
      blocks,
      toc: mdxContent.scope?.toc || { content: '', json: [] },
      plainMarkdown: markdown,
    }
  } catch (error) {
    console.error('Error processing CMS content:', error)

    // Fallback to basic conversion
    const plainMarkdown = convertRichTextToMarkdown(richTextContent)
    const mdxContent = await mdxSerialize(plainMarkdown, { tocDepth })

    return {
      content: mdxContent,
      blocks: [],
      toc: mdxContent.scope?.toc || { content: '', json: [] },
      plainMarkdown,
    }
  }
}

/**
 * Legacy function for processing content without blocks (for backward compatibility)
 */
export async function processCMSContentLegacy(
  richTextContent: any,
  tocDepth: number = 3
): Promise<{
  content: MDXRemoteSerializeResult
  toc: { content: string; json: any[] }
  plainMarkdown: string
}> {
  const plainMarkdown = convertRichTextToMarkdown(richTextContent)
  const mdxContent = await mdxSerialize(plainMarkdown, { tocDepth })

  return {
    content: mdxContent,
    toc: mdxContent.scope?.toc || { content: '', json: [] },
    plainMarkdown,
  }
}
