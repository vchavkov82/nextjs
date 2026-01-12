'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MenuId } from '~/components/Navigation/NavigationMenu/NavigationMenu'
import type { ICommonItem } from '~/components/reference/Reference.types'
import type { Json } from '~/features/helpers.types'
import { menuState } from '../../../hooks/useMenuState'

// Keep imports explicit so bundlers don't crawl the whole spec directory
const commonSectionsImports: Record<string, () => Promise<{ default: ICommonItem[] }>> = {
  'common-api-sections.json': () => import('~/spec/common-api-sections.json'),
  'common-cli-sections.json': () => import('~/spec/common-cli-sections.json'),
  'common-client-libs-sections.json': () => import('~/spec/common-client-libs-sections.json'),
  'common-self-hosting-analytics-sections.json': () =>
    import('~/spec/common-self-hosting-analytics-sections.json'),
  'common-self-hosting-auth-sections.json': () =>
    import('~/spec/common-self-hosting-auth-sections.json'),
  'common-self-hosting-functions-sections.json': () =>
    import('~/spec/common-self-hosting-functions-sections.json'),
  'common-self-hosting-realtime-sections.json': () =>
    import('~/spec/common-self-hosting-realtime-sections.json'),
  'common-self-hosting-storage-sections.json': () =>
    import('~/spec/common-self-hosting-storage-sections.json'),
}

const specImports: Record<string, () => Promise<{ default: Json }>> = {
  supabase_dart_v2: () => import('~/spec/supabase_dart_v2.yml'),
  supabase_dart_v1: () => import('~/spec/supabase_dart_v1.yml'),
  supabase_csharp_v1: () => import('~/spec/supabase_csharp_v1.yml'),
  supabase_csharp_v0: () => import('~/spec/supabase_csharp_v0.yml'),
  supabase_py_v2: () => import('~/spec/supabase_py_v2.yml'),
  supabase_swift_v2: () => import('~/spec/supabase_swift_v2.yml'),
  supabase_swift_v1: () => import('~/spec/supabase_swift_v1.yml'),
  supabase_kt_v3: () => import('~/spec/supabase_kt_v3.yml'),
  supabase_kt_v2: () => import('~/spec/supabase_kt_v2.yml'),
  supabase_kt_v1: () => import('~/spec/supabase_kt_v1.yml'),
}

export function getPathWithoutHash(relativePath: string) {
  return new URL(relativePath, 'http://placeholder').pathname
}

/**
 * Recursively filter common sections and their sub items based on
 * what is available in their spec
 */
export function deepFilterSections<T extends ICommonItem>(
  sections: T[],
  specFunctionIds: string[]
): T[] {
  return sections
    .filter(
      (section) =>
        section.type === 'category' ||
        section.type === 'markdown' ||
        specFunctionIds.includes(section.id)
    )
    .flatMap((section) => {
      if ('items' in section) {
        const items = deepFilterSections(section.items, specFunctionIds)

        // Only include this category (heading) if it has subitems
        if (items.length > 0) {
          return {
            ...section,
            items,
          }
        }

        return []
      }
      return section
    })
}

/**
 * Imports common sections file dynamically.
 *
 * Dynamic imports allow for code splitting which
 * dramatically reduces app bundle size.
 *
 * See https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
 */
export function useCommonSections(
  commonSectionsFile: string,
  { enabled = true }: { enabled: boolean }
) {
  const [commonSections, setCommonSections] = useState<ICommonItem[]>()
  const importer = commonSectionsImports[commonSectionsFile]

  useEffect(() => {
    if (!enabled || !importer) {
      setCommonSections(undefined)
      return
    }

    let cancelled = false
    async function fetchCommonSections() {
      const result = await importer()
      if (!cancelled) setCommonSections(result.default)
    }
    fetchCommonSections()
    return () => {
      cancelled = true
    }
  }, [enabled, importer])

  if (!enabled || !importer) {
    return null
  }

  return commonSections
}

/**
 * Imports spec file dynamically.
 *
 * Dynamic imports allow for code splitting which
 * dramatically reduces app bundle size.
 *
 * See https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
 */
export function useSpec(specFile?: string) {
  const [spec, setSpec] = useState<Json>()
  const importer = specFile ? specImports[specFile] : undefined

  useEffect(() => {
    if (!importer) {
      setSpec(undefined)
      return
    }
    async function fetchSpec() {
      const specModule = await importer()
      setSpec(specModule.default)
    }
    fetchSpec()
  }, [importer])

  return spec
}

export const getMenuId = (pathname: string | null) => {
  pathname = (pathname ??= '').replace(/^\/guides\//, '')

  switch (true) {
    case pathname.startsWith('ai'):
      return MenuId.Ai
    case pathname.startsWith('api'):
      return MenuId.Api
    case pathname.startsWith('auth'):
      return MenuId.Auth
    case pathname.startsWith('cron'):
      return MenuId.Cron
    case pathname.startsWith('database'):
      return MenuId.Database
    case pathname.startsWith('deployment'):
      return MenuId.Deployment
    case pathname.startsWith('ci-cd-runners'):
      return MenuId.CiCdRunners
    case pathname.startsWith('functions'):
      return MenuId.Functions
    case pathname.startsWith('getting-started'):
      return MenuId.GettingStarted
    case pathname.startsWith('graphql'):
      return MenuId.Graphql
    case pathname.startsWith('integrations'):
      return MenuId.Integrations
    case pathname.startsWith('local-development'):
      return MenuId.LocalDevelopment
    case pathname.startsWith('telemetry'):
      return MenuId.Telemetry
    case pathname.startsWith('platform'):
      return MenuId.Platform
    case pathname.startsWith('queues'):
      return MenuId.Queues
    case pathname.startsWith('realtime'):
      return MenuId.Realtime
    case pathname.startsWith('resources'):
      return MenuId.Resources
    case pathname.startsWith('security'):
      return MenuId.Security
    case pathname.startsWith('self-hosting'):
      return MenuId.SelfHosting
    case pathname.startsWith('storage'):
      return MenuId.Storage
    case pathname.startsWith('/contributing'):
      return MenuId.Contributing
    default:
      return MenuId.GettingStarted
  }
}

export const useCloseMenuOnRouteChange = () => {
  const pathname = usePathname()

  useEffect(() => {
    menuState.setMenuMobileOpen(false)
  }, [pathname])
}
