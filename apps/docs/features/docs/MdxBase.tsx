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
    // STRIP FRONTMATTER FIRST, before any preprocessing
    // The getData error occurs when gray-matter or compileMDX detects frontmatter delimiters
    // We must remove frontmatter completely before preprocessing or compilation
    // Use regex-based removal to avoid gray-matter issues with "this.getData is not a function"
    let sourceWithoutFrontmatter = String(source || '')

    // Aggressive regex removal to ensure no frontmatter delimiters remain
    // This handles edge cases and malformed frontmatter that gray-matter might miss
    sourceWithoutFrontmatter = sourceWithoutFrontmatter
      // Remove YAML frontmatter (--- ... ---) - most common format
      .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/m, '')
      // Remove YAML frontmatter without closing delimiter (malformed)
      .replace(/^---\s*\n[\s\S]*?(?=\n[A-Za-z#])/m, '')
      // Remove TOML frontmatter (+++ ... +++), though less common
      .replace(/^\+\+\+\s*\n[\s\S]*?\n\+\+\+\s*\n?/m, '')
      // Remove any remaining triple-dash patterns at the very start
      .replace(/^---[^\n]*---\s*\n?/m, '')
      // Trim any leading whitespace/newlines that might confuse parsers
      .trimStart()

    // SECOND PASS: Check if source STILL starts with --- and do line-by-line parsing if needed
    if (sourceWithoutFrontmatter.trim().startsWith('---')) {
      const lines = sourceWithoutFrontmatter.split('\n')
      let skipUntilIndex = 0

      // Find the closing --- delimiter
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          skipUntilIndex = i + 1
          break
        }
      }

      // If no closing found, skip all leading YAML-like lines
      if (skipUntilIndex === 0) {
        skipUntilIndex = lines.findIndex(
          (line, idx) =>
            idx > 0 &&
            line.trim() !== '' &&
            line.trim() !== '---' &&
            !line.match(/^[\w\-]+:\s*/) // Skip YAML key:value lines
        )
        if (skipUntilIndex < 0) skipUntilIndex = 1
      }

      sourceWithoutFrontmatter = lines.slice(skipUntilIndex).join('\n').trimStart()
    }

    // Ensure we have valid, non-empty content
    if (
      !sourceWithoutFrontmatter ||
      typeof sourceWithoutFrontmatter !== 'string' ||
      sourceWithoutFrontmatter.trim().length === 0
    ) {
      throw new Error('Invalid or empty MDX source after frontmatter removal')
    }

    const preprocess = customPreprocess ?? preprocessMdxWithDefaults
    const preprocessedSource = await preprocess(sourceWithoutFrontmatter)

    const resolvedSource = preprocessedSource.replace(
      /isFeatureEnabled\(['"]([^'"]+)['"]\)/g,
      (match, feature) => {
        try {
          return String(isFeatureEnabled(feature as any))
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            process.stderr.write(
              `Error resolving feature flag "${feature}": ${error instanceof Error ? error.message : String(error)}\n`
            )
          }
          return 'false'
        }
      }
    )

    // Final safety check: ensure no frontmatter was re-introduced during preprocessing
    let finalSource = resolvedSource.replace(/^---[\s\S]*?---\s*\n?/m, '').trimStart()

    // Additional check: if source still starts with ---, remove it completely
    if (finalSource.startsWith('---')) {
      const lines = finalSource.split('\n')
      let skipIndex = 0
      // Skip frontmatter block if present
      if (lines[0] === '---') {
        skipIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---')
        if (skipIndex > 0) {
          finalSource = lines.slice(skipIndex + 1).join('\n').trimStart()
        } else {
          // No closing --- found, skip until first non-empty line that's not ---
          skipIndex = lines.findIndex(
            (line, idx) => idx > 0 && line.trim() !== '---' && line.trim() !== ''
          )
          if (skipIndex > 0) {
            finalSource = lines.slice(skipIndex).join('\n').trimStart()
          }
        }
      }
    }

    if (!finalSource || finalSource.trim().length === 0) {
      throw new Error('MDX source is empty after processing')
    }

    const mergedComponents = { ...components, ...customComponents }

    const result = await compileMDX({
      source: finalSource,
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
      process.stderr.write(
        JSON.stringify(
          {
            type: 'MDX compilation error',
            message: errorMsg,
            stack: errorStack,
            sourcePreview: source.substring(0, 300),
          },
          null,
          2
        ) + '\n'
      )
    }
    throw error
  }
}

export { MDXRemoteBase }
