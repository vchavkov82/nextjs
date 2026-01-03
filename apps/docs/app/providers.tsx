'use client'

<<<<<<< HEAD
import 'config/code-hike.scss'
import 'ui-patterns/ShimmeringLoader/index.css'
import '../styles/new-docs.scss'
import '../styles/prism-okaidia.scss'

=======
>>>>>>> b333ef10b8 (clean up docs errors)
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
