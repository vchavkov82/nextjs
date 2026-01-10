import matter from 'gray-matter'
import { promises as fs } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { extractMessageFromAnyError, FileNotFoundError, MultiError } from '~/app/api/utils'
import { preprocessMdxWithDefaults } from '~/features/directives/utils'
import { checkGuidePageEnabled } from '~/features/docs/NavigationPageStatus.utils'
import { Both, Result } from '~/features/helpers.fn'
import { GUIDES_DIRECTORY } from '~/lib/docs'
import { processMdx } from '~/scripts/helpers.mdx'
import { GuideModel } from './guideModel'

/**
 * Ensures that no frontmatter delimiters remain in the content.
 * This is critical to prevent the MDX compiler from trying to parse
 * frontmatter and causing "this.getData is not a function" errors.
 */
function ensureFrontmatterRemoved(content: string): string {
  if (!content || typeof content !== 'string') return ''

  let cleaned = content

  // Remove YAML frontmatter (--- ... ---) - most common format
  cleaned = cleaned.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/m, '')

  // Remove TOML frontmatter (+++ ... +++), though less common
  cleaned = cleaned.replace(/^\+\+\+\s*\n[\s\S]*?\n\+\+\+\s*\n?/m, '')

  // If still starts with ---, manually find and skip frontmatter block
  if (cleaned.trim().startsWith('---')) {
    const lines = cleaned.split('\n')
    let startIndex = 0

    if (lines[0]?.trim() === '---') {
      // Find the closing ---
      const closingIndex = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---')
      if (closingIndex > 0) {
        startIndex = closingIndex + 1
      } else {
        // No closing found, skip until first content line
        startIndex = lines.findIndex(
          (line, idx) =>
            idx > 0 &&
            line.trim() !== '' &&
            line.trim() !== '---' &&
            !line.match(/^[\w-]+:\s*/) // Skip YAML key:value lines
        )
        if (startIndex < 0) startIndex = 1 // Skip at least the opening ---
      }
    }

    cleaned = lines.slice(startIndex).join('\n')
  }

  // Trim leading whitespace
  cleaned = cleaned.trimStart()

  return cleaned
}

/**
 * Determines if a file is hidden.
 *
 * A file is hidden if its name, or the name of any of its parent directories,
 * starts with an underscore.
 */
function isHiddenFile(path: string): boolean {
  return path.split('/').some((part) => part.startsWith('_'))
}

/**
 * Determines if a guide file is disabled in the navigation configuration.
 *
 * @param relPath - Relative path to the .mdx file within the base directory
 * @param baseDir - Base directory to calculate relPath from
 * @returns true if the page is disabled, false if enabled
 */
function isDisabledGuide(relPath: string, baseDir: string): boolean {
  const fullPath = resolve(baseDir, relPath)
  if (!fullPath.startsWith(GUIDES_DIRECTORY)) return false

  const relGuidePath = relative(GUIDES_DIRECTORY, fullPath)
  const urlPath = relGuidePath.replace(/\.mdx?$/, '').replace(/\/index$/, '')
  const guidesPath = `/guides/${urlPath}`

  return !checkGuidePageEnabled(guidesPath)
}

/**
 * Recursively walks a directory and collects all .mdx files that are not hidden.
 */
async function walkMdxFiles(
  dir: string,
  multiError: { current: MultiError | null }
): Promise<Array<string>> {
  const readDirResult = await Result.tryCatch(
    () => fs.readdir(dir, { recursive: true }),
    (error) => error
  )

  return readDirResult.match(
    (allPaths) => {
      const mdxFiles: string[] = []

      for (const relativePath of allPaths) {
        if (isHiddenFile(relativePath)) {
          continue
        }

        if (isDisabledGuide(relativePath, dir)) {
          continue
        }

        if (relativePath.endsWith('.mdx')) {
          mdxFiles.push(join(dir, relativePath))
        }
      }

      return mdxFiles
    },
    (error) => {
      // If we can't read the directory, add it to the error collection
      ; (multiError.current ??= new MultiError('Failed to load some guides:')).appendError(
        `Failed to read directory ${dir}: ${extractMessageFromAnyError(error)}`,
        error
      )
      return []
    }
  )
}

/**
 * Node.js-specific loader for GuideModel instances from the filesystem.
 * This class contains all the filesystem operations that require Node.js capabilities.
 */
export class GuideModelLoader {
  /**
   * Creates a GuideModel instance by loading and processing a markdown file from the filesystem.
   *
   * @param relPath - Relative path to the markdown file within the guides directory (e.g., "auth/users.mdx")
   * @returns A Result containing either the processed GuideModel or an error message
   *
   * @example
   * ```typescript
   * const result = await GuideModelLoader.fromFs('auth/users.mdx')
   * result.match(
   *   (guide) => console.log(guide.title, guide.subsections.length),
   *   (error) => console.error(error)
   * )
   * ```
   */
  static async fromFs(relPath: string): Promise<Result<GuideModel, Error>> {
    return Result.tryCatch(
      async () => {
        // Read the markdown file from the guides directory
        const filePath = join(GUIDES_DIRECTORY, relPath)
        const fileContent = await fs.readFile(filePath, 'utf-8')

        // Parse frontmatter using gray-matter
        const { data: metadata, content: rawContent } = matter(fileContent)

        // CRITICAL: Ensure all frontmatter is completely removed
        // This prevents the MDX compiler from seeing --- delimiters and causing
        // "this.getData is not a function" errors
        const contentWithoutFrontmatter = ensureFrontmatterRemoved(rawContent)

        // Replace partials and code samples using directives
        const processedContent = await preprocessMdxWithDefaults(contentWithoutFrontmatter)

        // DOUBLE-CHECK: Ensure preprocessing didn't reintroduce frontmatter
        // This can happen if the preprocessing transforms introduce --- patterns
        const finalContent = ensureFrontmatterRemoved(processedContent)

        // Process MDX to get chunked sections for embedding
        const { sections } = await processMdx(finalContent)

        // Create subsections from the chunked sections
        const subsections = sections.map((section) => ({
          title: section.heading,
          href: section.slug,
          content: section.content,
        }))

        // Extract title from metadata or first heading
        const title = metadata.title || sections.find((s) => s.heading)?.heading

        // Create href from relative path (remove .mdx extension)
        const href = `https://www.assistance.bg/docs/guides/${relPath.replace(/\.mdx?$/, '')}`

        return new GuideModel({
          title,
          href,
          content: finalContent,
          metadata,
          subsections,
        })
      },
      (error) => {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          return new FileNotFoundError('', error)
        }
        return new Error(
          `Failed to load guide from ${relPath}: ${extractMessageFromAnyError(error)}`,
          {
            cause: error,
          }
        )
      }
    )
  }

  /**
   * Loads GuideModels from a list of file paths in parallel, collecting any
   * errors without stopping.
   */
  private static async loadGuides(
    filePaths: Array<string>,
    multiError: { current: MultiError | null }
  ): Promise<Array<GuideModel>> {
    const loadPromises = filePaths.map(async (filePath) => {
      const relPath = relative(GUIDES_DIRECTORY, filePath)
      return this.fromFs(relPath)
    })

    const results = await Promise.all(loadPromises)
    const guides: Array<GuideModel> = []

    results.forEach((result, index) => {
      const relPath = relative(GUIDES_DIRECTORY, filePaths[index])

      result.match(
        (guide) => guides.push(guide),
        (error) => {
          ; (multiError.current ??= new MultiError('Failed to load some guides:')).appendError(
            `Failed to load ${relPath}: ${extractMessageFromAnyError(error)}`,
            error
          )
        }
      )
    })

    return guides
  }

  /**
   * Loads all guide models from the filesystem by walking the content directory.
   *
   * This method recursively walks the guides directory (or a specific section
   * subdirectory) and loads all non-hidden .mdx files.
   *
   * If errors occur while loading individual files, they are collected but
   * don't prevent other files from loading.
   *
   * @param section - Optional section name to limit walking to a specific
   * subdirectory (e.g., "database", "auth")
   * @returns A Both containing [successful GuideModels, MultiError with all
   * failures or null if no errors]
   *
   * @example
   * ```typescript
   * // Load all guides
   * const guides = (await GuideModelLoader.allFromFs()).unwrapLeft()
   *
   * // Load only database guides
   * const dbGuides = (await GuideModelLoader.allFromFs('database')).unwrapLeft()
   * ```
   */
  static async allFromFs(section?: string): Promise<Both<Array<GuideModel>, MultiError | null>> {
    const searchDir = section ? join(GUIDES_DIRECTORY, section) : GUIDES_DIRECTORY
    const multiError = { current: null as MultiError | null }

    // Get all .mdx files in the search directory
    const mdxFiles = await walkMdxFiles(searchDir, multiError)

    // Load each file and collect results
    const guides = await this.loadGuides(mdxFiles, multiError)

    return new Both(guides, multiError.current)
  }
}
