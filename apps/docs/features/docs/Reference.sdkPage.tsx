import * as NavItemsModule from '~/components/Navigation/NavigationMenu/NavigationMenu.constants'
import { REFERENCES } from '~/content/navigation.references'
import { ClientLibHeader } from '~/features/docs/Reference.header'
import { ClientLibIntroduction, OldVersionAlert } from '~/features/docs/Reference.introduction'
import { ReferenceNavigation } from '~/features/docs/Reference.navigation'
import { ReferenceContentScrollHandler } from '~/features/docs/Reference.navigation.client'
import { RefSections } from '~/features/docs/Reference.sections'
import { LayoutMainContent } from '~/layouts/DefaultLayout'
import { SidebarSkeleton } from '~/layouts/MainSkeleton'

interface ClientSdkReferenceProps {
  sdkId: string
  libVersion: string
}

export async function ClientSdkReferencePage({ sdkId, libVersion }: ClientSdkReferenceProps) {
  const libraryMeta = REFERENCES[sdkId]
  const versions = libraryMeta?.versions ?? []
  const isLatestVersion = libVersion === versions[0]

  // Extract plain object to avoid passing Module object to client components
  const menuDataRaw = NavItemsModule[libraryMeta.meta[libVersion].libId]
  
  // Ensure we create a plain serializable object without functions or module references
  const menuData = {
    title: menuDataRaw.title,
    icon: menuDataRaw.icon,
    pkg: {
      name: menuDataRaw.pkg.name,
      repo: menuDataRaw.pkg.repo,
    },
  }

  return (
    <ReferenceContentScrollHandler
      libPath={libraryMeta.libPath}
      version={libVersion}
      isLatestVersion={isLatestVersion}
    >
      <SidebarSkeleton
        menuId={libraryMeta.meta[libVersion].libId}
        NavigationMenu={
          <ReferenceNavigation
            libraryId={sdkId}
            name={menuData.title}
            menuData={menuData}
            libPath={libraryMeta.libPath}
            version={libVersion}
            isLatestVersion={isLatestVersion}
          />
        }
      >
        <LayoutMainContent>
          {!isLatestVersion && (
            <OldVersionAlert
              libPath={libraryMeta.libPath}
              className="z-20 fixed top-[calc(var(--header-height)+1rem)] right-4 w-84 max-w-[calc(100vw-2rem)]"
            />
          )}
          <article className="@container/article">
            <ClientLibHeader menuData={menuData} className="mt-4 mb-8" />
            <ClientLibIntroduction
              libPath={libraryMeta.libPath}
              excludeName={libraryMeta.meta[libVersion].libId}
              version={libVersion}
              isLatestVersion={isLatestVersion}
            />
            <RefSections libraryId={sdkId} version={libVersion} />
          </article>
        </LayoutMainContent>
      </SidebarSkeleton>
    </ReferenceContentScrollHandler>
  )
}
