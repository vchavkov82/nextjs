import { useEffect, useState } from 'react'
import { IS_PLATFORM, PageTelemetry, useThemeSandbox } from 'common'
import { useConsentToast } from 'ui-patterns/consent'

interface AppProvidersProps {
    API_URL: string
}

/**
 * Component that wraps hooks which depend on browser-only state (consent, theme sandbox)
 * This is needed because these hooks use reactive state (Valtio) that may differ
 * between server and client on initial render
 */
export function AppProviders({ API_URL }: AppProvidersProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Only call hooks and render after mount to prevent hydration mismatch
    if (!isMounted) {
        return null
    }

    return <AppProvidersContent API_URL={API_URL} />
}

function AppProvidersContent({ API_URL }: { API_URL: string }) {
    const { hasAcceptedConsent } = useConsentToast()

    // Initialize browser-dependent features after mount
    useThemeSandbox()

    return (
        <PageTelemetry
            API_URL={API_URL}
            hasAcceptedConsent={hasAcceptedConsent}
            enabled={IS_PLATFORM}
        />
    )
}
