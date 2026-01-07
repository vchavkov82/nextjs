'use client'

import { SandpackProvider, SandpackLayout, SandpackPreview } from '@codesandbox/sandpack-react'
import { useEffect, useState } from 'react'
import './sandpack-styles.css' // Import custom Sandpack styles
import { SandpackErrorBoundary } from './SandpackErrorBoundary'

type SandpackProps = {
  files: Record<string, string>
  dependencies?: Record<string, string>
}

export default function SandpackWrapper({ files, dependencies = {} }: SandpackProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [cryptoAvailable, setCryptoAvailable] = useState(false)

  // Only render Sandpack after component is mounted to avoid SSR issues
  useEffect(() => {
    setIsMounted(true)
    // Check if crypto.subtle is available and functional (required for Sandpack's ID generation)
    // crypto.subtle requires secure context (HTTPS or localhost)
    if (typeof window !== 'undefined') {
      try {
        const hasCrypto =
          window.crypto &&
          window.crypto.subtle &&
          typeof window.crypto.subtle.digest === 'function'
        setCryptoAvailable(hasCrypto)
      } catch (e) {
        // crypto.subtle not available
        setCryptoAvailable(false)
      }
    }
  }, [])

  // Ensure we have the required files for React template
  const completeFiles = {
    '/App.js': files['/App.js'] || files['App.js'] || '',
    '/styles.css': files['/styles.css'] || files['styles.css'] || '',
    ...files,
  }

  // Default dependencies
  const defaultDependencies = {
    '@supabase/supabase-js': 'latest',
    'lucide-react': 'latest',
  }

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-surface-50">
        <div className="text-foreground-light text-sm">Loading preview...</div>
      </div>
    )
  }

  // Show error if crypto.subtle is not available (requires HTTPS/secure context)
  if (!cryptoAvailable) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-surface-50 p-4">
        <div className="text-center max-w-md">
          <p className="text-foreground-light text-sm mb-2">
            Code preview requires a secure connection (HTTPS) to function properly.
          </p>
          <p className="text-foreground-lighter text-xs">
            Please access this page over HTTPS to view the interactive code examples.
          </p>
        </div>
      </div>
    )
  }

  return (
    <SandpackErrorBoundary>
      <div className="h-full w-full">
        <SandpackProvider
          template="react"
          files={completeFiles}
          customSetup={{
            dependencies: {
              ...defaultDependencies,
              ...dependencies,
            },
          }}
          options={{
            experimental_enableServiceWorker: false,
            visibleFiles: ['/App.js'],
            initMode: 'user-visible',
            activeFile: '/App.js',
            externalResources: ['https://cdn.tailwindcss.com'],
            logLevel: 'error',
          }}
        >
          <SandpackLayout className="!h-full !min-h-full !border-none !bg-surface-50 !rounded-none !flex !flex-col">
            <SandpackPreview
              showNavigator={false}
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              className="!h-full !flex-1 !border-none"
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </SandpackErrorBoundary>
  )
}
