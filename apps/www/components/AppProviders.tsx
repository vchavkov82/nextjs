import { useEffect, useState } from 'react'
import { useThemeSandbox } from 'common'

interface AppProvidersProps {
    API_URL: string
}

/**
 * Component that wraps hooks which depend on browser-only state (theme sandbox)
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

    return <AppProvidersContent />
}

function AppProvidersContent() {
    // Initialize browser-dependent features after mount
    useThemeSandbox()

    return null
}
