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
    
    try {
      // Ensure source absolutely doesn't start with frontmatter markers
      // This is critical - even with parseFrontmatter: false, if the source
      // starts with ---, the MDX compiler may still try to parse it and cause getData error
      let finalCleanSource = cleanSource
      if (finalCleanSource.trim().startsWith('---')) {
        // More aggressive removal - find the first non-frontmatter line
        const lines = finalCleanSource.split('\n')
        let startIndex = 0
        if (lines[0]?.trim() === '---') {
          // Find the closing --- or the first content line
          const closingIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---')
          if (closingIndex > 0) {
            startIndex = closingIndex + 1
          } else {
            // No closing found, find first non-empty, non-dash line
            startIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() !== '---' && line.trim() !== '')
            if (startIndex < 0) startIndex = 0
          }
        }
        finalCleanSource = lines.slice(startIndex).join('\n').trimStart()
      }
      
      // Final safety check - remove any remaining frontmatter patterns
      finalCleanSource = finalCleanSource.replace(/^---[\s\S]*?---\s*\n?/m, '').trimStart()
      
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
        try {
          console.error('MDX compilation error:', {
            error: compileError instanceof Error ? compileError.message : String(compileError),
            stack: compileError instanceof Error ? compileError.stack : undefined,
            sourcePreview:
              typeof cleanSource === 'string' && cleanSource.length > 0
                ? cleanSource.substring(0, 200)
                : 'Source not available',
            hasFrontmatterMarkers:
              typeof cleanSource === 'string' ? /^---/m.test(cleanSource) : false,
          })
        } catch (logError) {
          // If logging itself fails, just log the basic error
          console.error('MDX compilation failed. Error logging also failed:', logError)
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
