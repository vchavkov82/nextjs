'use client'

import { useSendTelemetryEvent } from 'lib/telemetry'
import TwitterSocialSection, { type TwitterSocialSectionProps } from '../TwitterSocialSection'
import getContent from '@/data/home/content'

export default function TwitterSocialSectionWithTelemetry() {
  const sendTelemetryEvent = useSendTelemetryEvent()
  const content = getContent(sendTelemetryEvent)

  return <TwitterSocialSection {...content.twitterSocialSection} />
}

