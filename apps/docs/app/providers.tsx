'use client'

import { TelemetryTagManager } from 'common'
import { GlobalProviders } from '~/features/app.providers'
import { TopNavSkeleton } from '~/layouts/MainSkeleton'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TelemetryTagManager />
      <GlobalProviders>
        <TopNavSkeleton>{children}</TopNavSkeleton>
      </GlobalProviders>
    </>
  )
}
