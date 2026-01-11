'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/compat/router'
import useDarkLaunchWeeks from '../hooks/useDarkLaunchWeeks'

export function useForceDeepDark() {
  const router = useRouter()
  const { resolvedTheme, theme } = useTheme()

  const isDarkTheme = resolvedTheme?.includes('dark')
  const forceDarkMode = useDarkLaunchWeeks()

  useEffect(() => {
    // Only update if theme is actually resolved to prevent hydration mismatch
    if (!resolvedTheme && !forceDarkMode) return

    const themeValue = forceDarkMode || isDarkTheme ? 'dark' : 'light'

    // Use requestAnimationFrame to ensure DOM updates happen after paint
    requestAnimationFrame(() => {
      document.documentElement.setAttribute('data-theme', themeValue)
      document.documentElement.style.colorScheme = themeValue
    })
  }, [resolvedTheme, theme, isDarkTheme, forceDarkMode, router])
}
