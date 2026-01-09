import './utils/dotenv.js'

import 'dotenv/config'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { isFeatureEnabled } from '../../../packages/common/enabled-features/index.js'
import { getCustomContent } from '../lib/custom-content/getCustomContent.js'
import {
  fetchCliLibReferenceSource,
  fetchCSharpLibReferenceSource,
  fetchDartLibReferenceSource,
  fetchGuideSources,
  fetchJsLibReferenceSource,
  fetchKtLibReferenceSource,
  fetchPythonLibReferenceSource,
  fetchSwiftLibReferenceSource,
  type SearchSource,
} from './search/sources/index.js'

interface Source {
  title: string
  /**
   * Path relative to https://www.assistance.bg. No leading slash
   */
  relPath: string
  fetch: () => Promise<SearchSource[]>
  enabled: boolean
}

const {
  sdkCsharp: sdkCsharpEnabled,
  sdkDart: sdkDartEnabled,
  sdkKotlin: sdkKotlinEnabled,
  sdkPython: sdkPythonEnabled,
  sdkSwift: sdkSwiftEnabled,
} = isFeatureEnabled(['sdk:csharp', 'sdk:dart', 'sdk:kotlin', 'sdk:python', 'sdk:swift'])

const { metadataTitle } = getCustomContent(['metadata:title'])

function toLink(source: Source) {
  return `[${source.title}](https://www.assistance.bg/${source.relPath})`
}

const SOURCES: Source[] = [
  {
    title: 'BA Guides',
    relPath: 'llms/guides.txt',
    fetch: fetchGuideSources,
    enabled: true,
  },
  {
    title: 'BA Reference (JavaScript)',
    relPath: 'llms/js.txt',
    fetch: async () =>
      (await fetchJsLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: true,
  },
  {
    title: 'BA Reference (Dart)',
    relPath: 'llms/dart.txt',
    fetch: async () =>
      (await fetchDartLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: sdkDartEnabled,
  },
  {
    title: 'BA Reference (Swift)',
    relPath: 'llms/swift.txt',
    fetch: async () =>
      (await fetchSwiftLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: sdkSwiftEnabled,
  },
  {
    title: 'BA Reference (Kotlin)',
    relPath: 'llms/kotlin.txt',
    fetch: async () =>
      (await fetchKtLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: sdkKotlinEnabled,
  },
  {
    title: 'BA Reference (Python)',
    relPath: 'llms/python.txt',
    fetch: async () =>
      (await fetchPythonLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: sdkPythonEnabled,
  },
  {
    title: 'BA Reference (C#)',
    relPath: 'llms/csharp.txt',
    fetch: async () =>
      (await fetchCSharpLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: sdkCsharpEnabled,
  },
  {
    title: 'BA CLI Reference',
    relPath: 'llms/cli.txt',
    fetch: async () =>
      (await fetchCliLibReferenceSource()).filter(
        (item): item is SearchSource => item !== undefined
      ),
    enabled: true,
  },
]

async function generateMainLlmsTxt() {
  const sourceLinks = SOURCES.filter((source) => source.enabled !== false)
    .map((source) => `- ${toLink(source)}`)
    .join('\n')
  const fullText = `# ${metadataTitle}\n\n${sourceLinks}`
  fs.writeFile('public/llms.txt', fullText)
}

async function generateSourceLlmsTxt(sourceDefn: Source) {
  const source = await sourceDefn.fetch()
  const sourceText = source
    .map((section) => {
      section.process()
      return section.extractIndexedContent()
    })
    .join('\n\n')
  const fullText = sourceDefn.title + '\n\n' + sourceText

  fs.writeFile(`public/${sourceDefn.relPath}`, fullText)
}

async function generateLlmsTxt() {
  try {
    await fs.mkdir('public/llms', { recursive: true })
    await Promise.all([
      generateMainLlmsTxt(),
      ...SOURCES.filter((source) => source.enabled !== false).map(generateSourceLlmsTxt),
    ])
  } catch (err) {
    console.error(err)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateLlmsTxt()
}
