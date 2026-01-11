import { type Metadata } from 'next'

import { TroubleshootingPreview } from '~/features/docs/Troubleshooting.ui'
import {
  TroubleshootingFilter,
  TroubleshootingFilterEmptyState,
  TroubleshootingListController,
} from '~/features/docs/Troubleshooting.ui.client'
import {
  getAllTroubleshootingEntries,
  getAllTroubleshootingErrors,
  getAllTroubleshootingKeywords,
  getAllTroubleshootingProducts,
} from '~/features/docs/Troubleshooting.utils'
import { TROUBLESHOOTING_CONTAINER_ID } from '~/features/docs/Troubleshooting.utils.shared'
import { SidebarSkeleton } from '~/layouts/MainSkeleton'
import { PROD_URL } from '~/lib/constants'
import { getCustomContent } from '~/lib/custom-content/getCustomContent'

const { metadataTitle } = getCustomContent(['metadata:title'])

export default async function GlobalTroubleshootingPage() {
  let troubleshootingEntries: Awaited<ReturnType<typeof getAllTroubleshootingEntries>> = []
  let keywords: Awaited<ReturnType<typeof getAllTroubleshootingKeywords>> = []
  let products: Awaited<ReturnType<typeof getAllTroubleshootingProducts>> = []
  let errors: Awaited<ReturnType<typeof getAllTroubleshootingErrors>> = []

  try {
    troubleshootingEntries = await getAllTroubleshootingEntries()
    keywords = await getAllTroubleshootingKeywords()
    products = await getAllTroubleshootingProducts()
    errors = await getAllTroubleshootingErrors()
  } catch (error) {
    console.error('Error loading troubleshooting data:', error)
  }

  return (
    <SidebarSkeleton hideSideNav className="w-full max-w-screen-lg mx-auto">
      <div className="py-8 px-5">
        <h1 className="text-4xl tracking-tight mb-7">Troubleshooting</h1>
        <p className="text-lg text-foreground-light">
          Search or browse our troubleshooting guides for solutions to common BA issues.
        </p>
        <hr className="my-7" aria-hidden />
        <TroubleshootingFilter
          keywords={keywords}
          products={products}
          errors={errors}
          className="mb-8"
        />
        <TroubleshootingListController />
        <TroubleshootingFilterEmptyState />
        <div id={TROUBLESHOOTING_CONTAINER_ID} className="@container/troubleshooting">
          <h2 className="sr-only">Matching troubleshooting entries</h2>
          {troubleshootingEntries && troubleshootingEntries.length > 0 ? (
            <div className="grid @4xl/troubleshooting:grid-cols-[78%_15%_7%] gap-y-4">
              {troubleshootingEntries.map((entry) => (
                <TroubleshootingPreview key={entry?.data?.database_id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-light">No troubleshooting entries available.</p>
          )}
        </div>
      </div>
    </SidebarSkeleton>
  )
}

export const metadata: Metadata = {
  title: `${metadataTitle || 'BA'} | Troubleshooting`,
  alternates: {
    canonical: `${PROD_URL}/guides/troubleshooting`,
  },
}
