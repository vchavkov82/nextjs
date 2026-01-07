import { InlineLink } from 'components/ui/InlineLink'
import { isValidElement, memo, PropsWithChildren, ReactElement, ReactNode } from 'react'
import { ReactMarkdown, ReactMarkdownOptions } from 'react-markdown/lib/react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from 'ui'

interface MarkdownProps extends Omit<ReactMarkdownOptions, 'children' | 'node'> {
  className?: string
  /** @deprecated  Should remove this and just take `children` instead */
  content?: string
  extLinks?: boolean
}

// Custom paragraph component to prevent nested <p> tags
// This prevents hydration errors when markdown renders paragraphs that contain other paragraphs
const Paragraph = memo(({ children, ...props }: JSX.IntrinsicElements['p']) => {
  // Helper to check if a child is a paragraph element
  const isParagraphElement = (child: ReactNode): boolean => {
    return isValidElement(child) && typeof child.type === 'string' && child.type === 'p'
  }

  // Check if any direct children are paragraph elements
  const hasNestedParagraphs = Array.isArray(children)
    ? children.some(isParagraphElement)
    : isParagraphElement(children)

  // If we have nested paragraphs, unwrap them to prevent invalid HTML nesting
  if (hasNestedParagraphs) {
    // Unwrap nested paragraphs - extract their children
    const unwrappedChildren = Array.isArray(children)
      ? children.flatMap((child) => {
          if (isParagraphElement(child)) {
            // If the nested paragraph has children, use them; otherwise use the element itself
            return child.props.children ?? child
          }
          return child
        })
      : isParagraphElement(children)
        ? (children as ReactElement).props.children ?? children
        : children

    // Use div instead of p to prevent nesting, but preserve all props (including className)
    return <div {...props}>{unwrappedChildren}</div>
  }

  return <p {...props}>{children}</p>
})
Paragraph.displayName = 'Paragraph'

export const Markdown = ({
  children,
  className,
  content = '',
  extLinks = false,
  ...props
}: PropsWithChildren<MarkdownProps>) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h3: ({ children }) => <h3 className="mb-1">{children}</h3>,
        code: ({ children }) => <code className="text-code-inline">{children}</code>,
        a: ({ href, children }) => <InlineLink href={href ?? '/'}>{children}</InlineLink>,
        p: Paragraph,
      }}
      {...props}
      className={cn('text-sm', className)}
    >
      {(children as string) ?? content}
    </ReactMarkdown>
  )
}
