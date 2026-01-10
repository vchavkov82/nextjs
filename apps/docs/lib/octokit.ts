import 'server-only'
import type { Octokit } from '@octokit/core'

import { fetchRevalidatePerDay } from '~/features/helpers.fetch'

let octokitInstance: Octokit | null = null
let octokitPromise: Promise<Octokit> | null = null

export async function octokit(): Promise<Octokit> {
  if (octokitInstance) {
    return octokitInstance
  }

  if (octokitPromise) {
    return octokitPromise
  }

  octokitPromise = (async () => {
    const privateKey = process.env.DOCS_GITHUB_APP_PRIVATE_KEY
    if (!privateKey) {
      throw new Error('DOCS_GITHUB_APP_PRIVATE_KEY environment variable is required for octokit')
    }

    // Use dynamic imports for ESM packages (@octokit/core and @octokit/auth-app are ESM-only)
    const { createAppAuth } = await import('@octokit/auth-app')
    const { Octokit: OctokitClass } = await import('@octokit/core')
    const crypto = await import('node:crypto')

    // https://github.com/gr2m/universal-github-app-jwt?tab=readme-ov-file#converting-pkcs1-to-pkcs8
    const privateKeyPkcs8 = crypto.createPrivateKey(privateKey).export({
      type: 'pkcs8',
      format: 'pem',
    })

    octokitInstance = new OctokitClass({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.DOCS_GITHUB_APP_ID,
        installationId: process.env.DOCS_GITHUB_APP_INSTALLATION_ID,
        privateKey: privateKeyPkcs8,
      },
    }) as Octokit

    return octokitInstance
  })()

  return octokitPromise
}

async function getGitHubFileContents({
  org,
  repo,
  path,
  branch,
  options: { onError, fetch },
}: {
  org: string
  repo: string
  path: string
  branch: string
  options: {
    onError: (err?: unknown) => void
    /**
     *
     * A custom fetch implementation to control Next.js caching.
     * By default, uses a "once-per-day" revalidation strategy.
     * This default may change later as we move to on-demand revalidation.
     */
    fetch?: (info: RequestInfo, init?: RequestInit) => Promise<Response>
  }
}) {
  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  try {
    const response = await (await octokit()).request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: org,
      repo: repo,
      path: path,
      ref: branch,
      options: {
        fetch: fetch ?? fetchRevalidatePerDay,
      },
    })
    if (response.status !== 200 || !response.data) {
      throw Error(`Could not find contents of ${path} in ${org}/${repo}`)
    }
    if (!('type' in response.data) || response.data.type !== 'file') {
      throw Error(`${path} in ${org}/${repo} is not a file`)
    }
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
    return content
  } catch (err) {
    console.error('Error fetching GitHub file: %o', err)
    onError?.(err)
    return ''
  }
}

export async function getGitHubFileContentsImmutableOnly({
  org,
  repo,
  branch,
  path,
  options: { onError, fetch },
}: {
  org: string
  repo: string
  branch: string
  path: string
  options: {
    onError: (error: unknown) => void
    fetch: (url: string) => Promise<Response>
  }
}): Promise<string> {
  const isImmutableCommit = await checkForImmutableCommit({
    org,
    repo,
    branch,
  })
  if (!isImmutableCommit) {
    throw Error('The commit is not an immutable commit SHA. Tags and branch names are not allowed.')
  }

  const result = await getGitHubFileContents({
    org,
    repo,
    branch,
    path,
    options: { onError, fetch },
  })
  return result || ''
}

async function checkForImmutableCommit({
  org,
  repo,
  branch,
  options: { fetch: _fetch = fetch } = {},
}: {
  org: string
  repo: string
  branch: string
  options?: {
    /**
     *
     * A custom fetch implementation to control Next.js caching.
     */
    fetch?: (info: RequestInfo, init?: RequestInit) => Promise<Response>
  }
}) {
  try {
    const response = await (await octokit()).request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', {
      owner: org,
      repo: repo,
      commit_sha: branch,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
      options: {
        fetch: _fetch,
      },
    })
    if (response.status === 200) {
      return true
    } else {
      throw Error(
        "Checking for an immutable commit didn't throw an error, but it also didn't return a 200. Erring on the side of safety, assuming this is not an immutable commit.",
        { cause: response }
      )
    }
  } catch (err) {
    console.error('Not an immutable commit: %o', err)
    return false
  }
}
