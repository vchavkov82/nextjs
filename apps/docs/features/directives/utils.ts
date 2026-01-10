import { type Root } from 'mdast'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { mdxToMarkdown } from 'mdast-util-mdx'
import { toMarkdown } from 'mdast-util-to-markdown'

import remarkMkDocsAdmonition from '~/lib/mdx/plugins/remarkAdmonition'
import remarkPyMdownTabs from '~/lib/mdx/plugins/remarkTabs'
import { getGitHubFileContentsImmutableOnly } from '~/lib/octokit'
import { codeSampleRemark } from './CodeSample'
import { codeTabsRemark } from './CodeTabs'
import { fromDocsMarkdown } from './utils.server'
import { partialsRemark } from './Partial'
import { showRemark } from './Show'

type Transformer = (ast: Root) => Root | Promise<Root>

export async function preprocessMdx<T>(mdx: string, transformers: Transformer[]) {
  if (!mdx || typeof mdx !== 'string') return mdx || ''

  // Transform StepHikeCompact component property access to flat component names FIRST
  // This must happen before parsing to MDX AST, as compileMDX from next-mdx-remote/rsc
  // doesn't properly support component property access like <StepHikeCompact.Step> during serialization
  let transformedMdx: string = mdx
    // Replace opening tags <StepHikeCompact.Step ...> or <StepHikeCompact.Step>
    .replace(/<StepHikeCompact\.Step(\s|>)/g, '<StepHikeCompactStep$1')
    // Replace closing tags </StepHikeCompact.Step>
    .replace(/<\/StepHikeCompact\.Step>/g, '</StepHikeCompactStep>')
    // Replace self-closing tags <StepHikeCompact.Step />
    .replace(/<StepHikeCompact\.Step\s*\/>/g, '<StepHikeCompactStep />')
    // Same for Details
    .replace(/<StepHikeCompact\.Details(\s|>)/g, '<StepHikeCompactDetails$1')
    .replace(/<\/StepHikeCompact\.Details>/g, '</StepHikeCompactDetails>')
    .replace(/<StepHikeCompact\.Details\s*\/>/g, '<StepHikeCompactDetails />')
    // Same for Code
    .replace(/<StepHikeCompact\.Code(\s|>)/g, '<StepHikeCompactCode$1')
    .replace(/<\/StepHikeCompact\.Code>/g, '</StepHikeCompactCode>')
    .replace(/<StepHikeCompact\.Code\s*\/>/g, '<StepHikeCompactCode />')

  let mdast = fromDocsMarkdown(transformedMdx)
  for (const transform of transformers) {
    mdast = await transform(mdast)
  }

  const output = toMarkdown(mdast, { extensions: [mdxToMarkdown(), gfmToMarkdown()] })
  return output || ''
}

export function preprocessMdxWithDefaults(mdx: string) {
  return preprocessMdx(mdx, [
    showRemark(),
    remarkMkDocsAdmonition(),
    remarkPyMdownTabs(),
    partialsRemark(),
    codeSampleRemark({
      fetchFromGitHub: getGitHubFileContentsImmutableOnly,
    }),
    codeTabsRemark(),
  ])
}
