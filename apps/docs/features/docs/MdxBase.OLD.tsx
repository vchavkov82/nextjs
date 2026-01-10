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
    // STRIP FRONTMATTER FIRST, before any preprocessing
    // The getData error occurs when compileMDX detects frontmatter delimiters
    // We must remove frontmatter completely before preprocessing or compilation
    let sourceWithoutFrontmatter: string

    try {
      // Use gray-matter to parse and extract frontmatter
      const parsed = matter(source, { excerpt: false })
      sourceWithoutFrontmatter = parsed.content || source
    } catch (error) {
      // If gray-matter fails, use regex-based removal
      sourceWithoutFrontmatter = source
    }

    // Aggressive regex removal to ensure no frontmatter delimiters remain
    // This handles edge cases and malformed frontmatter that gray-matter might miss
    // First pass: remove complete YAML/TOML frontmatter blocks
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
            !line.match(/^[\w\-]+:\s*/)  // Skip YAML key:value lines
        )
        if (skipUntilIndex < 0) skipUntilIndex = 1
      }

      sourceWithoutFrontmatter = lines.slice(skipUntilIndex).join('\n').trimStart()
    }

    // Ensure we have valid, non-empty content
    if (!sourceWithoutFrontmatter || typeof sourceWithoutFrontmatter !== 'string' || sourceWithoutFrontmatter.trim().length === 0) {
      throw new Error('Invalid or empty MDX source after frontmatter removal')
    }

    const preprocess = customPreprocess ?? preprocessMdxWithDefaults

    // Custom preprocessing to resolve isFeatureEnabled calls
    const resolveFeatureFlags = (mdx: string): string => {
      return mdx.replace(/isFeatureEnabled\(['"]([^'"]+)['"]\)/g, (match, feature) => {
        try {
          const result = isFeatureEnabled(feature as any)
          return String(result)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error resolving feature flag:', feature, error)
          }
          return 'false'
        }
      })
    }

    // Now preprocess the source (frontmatter already removed)
    const preprocessedSource = await preprocess(sourceWithoutFrontmatter)
    const resolvedSource = resolveFeatureFlags(preprocessedSource)

    // Note: StepHikeCompact component property access transformation is now handled
    // in the preprocessing step (see preprocessMdx in features/directives/utils.ts)

    // Final safety check: ensure no frontmatter was re-introduced during preprocessing
    // Also ensure the source doesn't start with frontmatter delimiters at all
    let finalSource = resolvedSource.replace(/^---[\s\S]*?---\s*\n?/m, '').trimStart()

    // Additional check: if source still starts with ---, remove it completely
    // This handles edge cases where preprocessing might have added something back
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
          skipIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() !== '---' && line.trim() !== '')
          if (skipIndex > 0) {
            finalSource = lines.slice(skipIndex).join('\n').trimStart()
          }
        }
      }
    }

    const mergedComponents = {
      ...components,
      ...customComponents,
    }

    // Use compileMDX with parseFrontmatter: false to avoid getData issue
    // The getData error occurs when compileMDX tries to parse frontmatter
    // We've already completely removed frontmatter, so this should be safe
    // Note: compileMDX from /rsc in next-mdx-remote v5 uses a nested options structure
    // Ensure source is clean and doesn't start with frontmatter markers
    if (!finalSource || finalSource.trim().length === 0) {
      throw new Error('MDX source is empty after frontmatter removal and preprocessing')
    }

    // Final check: ensure source doesn't start with --- (frontmatter delimiter)
    // This must be defined outside try block so it's accessible in catch block
    const cleanSource = finalSource.trim().startsWith('---')
      ? finalSource.replace(/^---[\s\S]*?---\s*\n?/m, '').trimStart()
      : finalSource

    // Declare finalCleanSource outside try block so it's accessible in catch for error logging
    let finalCleanSource = cleanSource

    try {
      // Ensure source absolutely doesn't start with frontmatter markers
      // This is critical - even with parseFrontmatter: false, if the source
      // starts with ---, the MDX compiler may still try to parse it and cause getData error

      // Multiple passes to ensure all frontmatter is removed
      let previousSource = ''
      let iterations = 0
      const maxIterations = 5

      while (finalCleanSource !== previousSource && iterations < maxIterations) {
        previousSource = finalCleanSource
        iterations++

        // Remove YAML frontmatter (--- ... ---)
        finalCleanSource = finalCleanSource.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/m, '')

        // Remove TOML frontmatter (+++ ... +++)
        finalCleanSource = finalCleanSource.replace(/^\+\+\+\s*\n[\s\S]*?\n\+\+\+\s*\n?/m, '')

        // If still starts with ---, manually find and skip frontmatter block
        if (finalCleanSource.trim().startsWith('---')) {
          const lines = finalCleanSource.split('\n')
          let startIndex = 0

          if (lines[0]?.trim() === '---') {
            // Find the closing ---
            const closingIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---')
            if (closingIndex > 0) {
              startIndex = closingIndex + 1
            } else {
              // No closing found, skip until first content line
              startIndex = lines.findIndex((line, idx) =>
                idx > 0 &&
                line.trim() !== '' &&
                line.trim() !== '---' &&
                !line.match(/^[\w-]+:\s*/)  // Skip YAML key:value lines
              )
              if (startIndex < 0) startIndex = 1 // Skip at least the opening ---
            }
          }

          finalCleanSource = lines.slice(startIndex).join('\n')
        }

        finalCleanSource = finalCleanSource.trimStart()
      }

      // Log if we still have frontmatter markers after cleanup
      if (process.env.NODE_ENV === 'development' && finalCleanSource.trim().startsWith('---')) {
        console.warn('WARNING: Source still starts with --- after cleanup:', {
          preview: finalCleanSource.substring(0, 100),
          iterations,
        })
      }

      // In next-mdx-remote v5, compileMDX from /rsc requires parseFrontmatter: false
      // and the options must be structured correctly
      const result = await compileMDX({
        source: finalCleanSource,
        components: mergedComponents,
        options: {
          parseFrontmatter: false, // Critical: must be false to prevent getData error
          mdxOptions: {
            remarkPlugins: [
              [remarkMath, { singleDollarTextMath: false }],
              remarkGfm,
            ],
            rehypePlugins: [rehypeKatex],
          },
        },
      })
      return result.content
    } catch (compileError: unknown) {
      // If the error is about getData, it means frontmatter parsing was triggered
      // Log more details in development to help debug
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = compileError instanceof Error ? compileError.message : String(compileError)
        const isGetDataError = errorMessage.includes('getData')

        try {
          console.warn('MDX compilation error:', {
            error: errorMessage,
            isGetDataError,
            stack: compileError instanceof Error ? compileError.stack : undefined,
            sourcePreview: finalCleanSource.substring(0, 300),
            startsWithDashes: finalCleanSource.trim().startsWith('---'),
            firstLine: finalCleanSource.split('\n')[0],
          })

          if (isGetDataError) {
            console.warn('getData error detected - frontmatter may still be present in source')
          }
        } catch (logError) {
          // If logging itself fails, just log the basic error
          console.warn('MDX compilation failed. Error logging also failed:', logError)
        }
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
