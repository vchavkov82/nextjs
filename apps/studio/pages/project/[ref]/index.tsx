import { Home } from 'components/interfaces/Home/Home'
import { HomeV2 } from 'components/interfaces/HomeNew/Home'
import DefaultLayout from 'components/layouts/DefaultLayout'
import { ProjectLayoutWithAuth } from 'components/layouts/ProjectLayout'
import { usePHFlag } from 'hooks/ui/useFlag'
import { isHomeNewVariant, type HomeNewFlagValue } from 'lib/featureFlags/homeNew'
import type { NextPageWithLayout } from 'types'
import { ErrorBoundary } from 'react-error-boundary'

const HomePage: NextPageWithLayout = () => {
  const homeNewVariant = usePHFlag<HomeNewFlagValue>('homeNew')
  const isHomeNewPH = isHomeNewVariant(homeNewVariant)

  // Don't render different components until feature flags are loaded to prevent hydration mismatch
  // undefined means flags are still loading
  if (homeNewVariant === undefined) {
    return (
      <ErrorBoundary fallback={<Home />}>
        <Home />
      </ErrorBoundary>
    )
  }

  if (isHomeNewPH) {
    return (
      <ErrorBoundary fallback={<Home />}>
        <HomeV2 />
      </ErrorBoundary>
    )
  }
  return (
    <ErrorBoundary fallback={<div>Error loading home page</div>}>
      <Home />
    </ErrorBoundary>
  )
}

HomePage.getLayout = (page) => (
  <DefaultLayout>
    <ProjectLayoutWithAuth>{page}</ProjectLayoutWithAuth>
  </DefaultLayout>
)

export default HomePage
