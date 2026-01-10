'use client'

import { useEffect, useState } from 'react'
import { PageTelemetry } from 'common'
import { useConsentToast } from 'ui-patterns/consent'

interface PageTelemetryClientProps {
    API_URL: string
    enabled: boolean
}

export function PageTelemetryClient({ API_URL, enabled }: PageTelemetryClientProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Only render after mount to prevent hydration mismatch with consent state
    if (!isMounted) {
        return null
    }

    return <PageTelemetryContent API_URL={API_URL} enabled={enabled} />
}

function PageTelemetryContent({ API_URL, enabled }: { API_URL: string; enabled: boolean }) {
    const { hasAcceptedConsent } = useConsentToast()

    return (
        <PageTelemetry
            API_URL={API_URL}
            hasAcceptedConsent={hasAcceptedConsent}
            enabled={enabled}
        />
    )
}
