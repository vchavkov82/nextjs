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
    // Validate input - return null if source is empty/invalid (graceful handling)
    // This prevents errors when pages have empty content sections
    // Also check for string values like "null", "undefined", etc.
    const trimmedSource = typeof source === 'string' ? source.trim() : ''
    const isInvalid =
      !source ||
      typeof source !== 'string' ||
      trimmedSource.length === 0 ||
      trimmedSource.toLowerCase() === 'null' ||
      trimmedSource.toLowerCase() === 'undefined'

    if (isInvalid) {
      if (process.env.NODE_ENV === 'development') {
        const sourceType = typeof source
        let sourceValue: string
        let reason: string
        
        if (source === null) {
          sourceValue = 'null'
          reason = 'source is null'
        } else if (source === undefined) {
          sourceValue = 'undefined'
          reason = 'source is undefined'
        } else if (typeof source !== 'string') {
          sourceValue = String(source)
          reason = `source is not a string (type: ${sourceType})`
        } else if (source.trim().length === 0) {
          sourceValue = source === '' ? '"" (empty string)' : `"${source}" (whitespace only)`
          reason = 'source is empty or whitespace only'
        } else if (trimmedSource.toLowerCase() === 'null') {
          sourceValue = `"${source}"`
          reason = 'source is the string "null"'
        } else if (trimmedSource.toLowerCase() === 'undefined') {
          sourceValue = `"${source}"`
          reason = 'source is the string "undefined"'
        } else {
          sourceValue = `"${source.substring(0, 100)}"`
          reason = 'unknown validation failure'
        }
        
        process.stderr.write(
          `Warning: MDXRemoteBase received empty or invalid source. Returning null. Reason: ${reason}. Source type: ${sourceType}, value: ${sourceValue}\n`
        )
      }
      return null
    }

    // STRIP FRONTMATTER FIRST, before any preprocessing
    // The getData error occurs when gray-matter or compileMDX detects frontmatter delimiters
    // We must remove frontmatter completely before preprocessing or compilation
    // Use regex-based removal to avoid gray-matter issues with "this.getData is not a function"
    // At this point, source is guaranteed to be a non-empty string (validated above)
    let sourceWithoutFrontmatter = source

    // Only attempt to remove frontmatter if the source actually starts with frontmatter delimiters
    // Content from GuideModelLoader already has frontmatter removed, so we need to be careful
    const sourceTrimmedForCheck = sourceWithoutFrontmatter.trim()
    const hasFrontmatter = sourceTrimmedForCheck.startsWith('---') || sourceTrimmedForCheck.startsWith('+++')

    if (hasFrontmatter) {
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
    } else {
      // Content doesn't have frontmatter, just trim whitespace
      sourceWithoutFrontmatter = sourceWithoutFrontmatter.trimStart()
    }

    // Ensure we have valid, non-empty content after processing
    if (
      !sourceWithoutFrontmatter ||
      typeof sourceWithoutFrontmatter !== 'string' ||
      sourceWithoutFrontmatter.trim().length === 0
    ) {
      const sourcePreview = source.substring(0, 200)
      throw new Error(
        `Invalid or empty MDX source after frontmatter removal. Original source preview: ${sourcePreview}`
      )
    }

    const preprocess = customPreprocess ?? preprocessMdxWithDefaults
    const preprocessedSource = await preprocess(sourceWithoutFrontmatter)

    // Check if preprocessing resulted in empty content
    if (!preprocessedSource || typeof preprocessedSource !== 'string' || preprocessedSource.trim().length === 0) {
      throw new Error(
        `MDX source became empty after preprocessing. Original source length: ${source.length}, after frontmatter removal: ${sourceWithoutFrontmatter.length}`
      )
    }

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
    // Only remove frontmatter if it actually exists (starts with --- or +++)
    let finalSource = resolvedSource
    const trimmedResolved = resolvedSource.trimStart()
    if (trimmedResolved.startsWith('---') || trimmedResolved.startsWith('+++')) {
      finalSource = resolvedSource.replace(/^---[\s\S]*?---\s*\n?/m, '').trimStart()
      finalSource = finalSource.replace(/^\+\+\+[\s\S]*?\+\+\+\s*\n?/m, '').trimStart()

      // Additional check: if source still starts with ---, remove it completely
      if (finalSource.trimStart().startsWith('---')) {
        const lines = finalSource.split('\n')
        let skipIndex = 0
        // Skip frontmatter block if present
        if (lines[0]?.trim() === '---') {
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
    } else {
      // No frontmatter detected, just trim
      finalSource = resolvedSource.trimStart()
    }

    if (!finalSource || finalSource.trim().length === 0) {
      const originalLength = source.length
      const afterFrontmatterLength = sourceWithoutFrontmatter?.length || 0
      const afterPreprocessLength = preprocessedSource?.length || 0
      const sourcePreview = source.substring(0, 300).replace(/\n/g, '\\n')
      throw new Error(
        `MDX source is empty after processing. Original length: ${originalLength}, after frontmatter removal: ${afterFrontmatterLength}, after preprocessing: ${afterPreprocessLength}, source preview: ${sourcePreview}`
      )
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
