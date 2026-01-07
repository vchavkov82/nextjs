'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SandpackErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sandpack Error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      const isCryptoError =
        this.state.error?.message?.includes('digest') ||
        this.state.error?.message?.includes('crypto') ||
        this.state.error?.message?.includes('subtle')

      // Return fallback UI or a simple error message
      return (
        this.props.fallback || (
          <div className="h-full w-full flex items-center justify-center bg-surface-50 p-4">
            <div className="text-center max-w-md">
              <p className="text-foreground-light text-sm mb-2">
                {isCryptoError
                  ? 'Code preview requires a secure connection (HTTPS) to function properly.'
                  : 'Unable to load code preview. Please try refreshing the page.'}
              </p>
              {isCryptoError && (
                <p className="text-foreground-lighter text-xs mt-2">
                  Please access this page over HTTPS to view the interactive code examples.
                </p>
              )}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

