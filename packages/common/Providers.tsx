'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // @ts-ignore next-themes is old :/
  // Props spread after hardcoded values to allow overriding
  // Default values are provided for cases where props aren't specified
  const {
    themes = ['dark', 'light'],
    defaultTheme = 'dark',
    ...restProps
  } = props

  return (
    <NextThemesProvider themes={themes} defaultTheme={defaultTheme} {...restProps}>
      {children}
    </NextThemesProvider>
  )
}
