'use client'

interface ConsentWrapperProps {
  children: React.ReactNode
}

export function ConsentWrapper({ children }: ConsentWrapperProps) {
  return <>{children}</>
}
