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
            // eslint-disable-next-line no-console
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
    try {
      const result = await compileMDX({
        source: finalSource,
        components: mergedComponents,
        options: {
          parseFrontmatter: false,
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
    } catch (compileError: any) {
      // If the error is about getData, it means frontmatter parsing was triggered
      // Log more details in development to help debug
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('MDX compilation error:', {
          error: compileError?.message,
          stack: compileError?.stack,
          sourcePreview: finalSource.substring(0, 200),
          hasFrontmatterMarkers: /^---/m.test(finalSource),
        })
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
