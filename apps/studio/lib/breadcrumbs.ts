// Sentry not imported - using DashboardBreadcrumb type from dashboard-logs
import type { DashboardBreadcrumb } from 'components/interfaces/Support/dashboard-logs'

import { RingBuffer } from './ringBuffer'

export const MIRRORED_BREADCRUMBS = new RingBuffer<DashboardBreadcrumb>(50)

export const getMirroredBreadcrumbs = (): DashboardBreadcrumb[] => {
  return MIRRORED_BREADCRUMBS.toArray()
}

let BREADCRUMB_SNAPSHOT: DashboardBreadcrumb[] | null = null

export const takeBreadcrumbSnapshot = (): void => {
  BREADCRUMB_SNAPSHOT = getMirroredBreadcrumbs()
}

export const getOwnershipOfBreadcrumbSnapshot = (): DashboardBreadcrumb[] | null => {
  const snapshot = BREADCRUMB_SNAPSHOT
  BREADCRUMB_SNAPSHOT = null
  return snapshot
}
