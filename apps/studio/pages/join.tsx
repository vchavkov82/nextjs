import Link from 'next/link'

import { OrganizationInvite } from 'components/interfaces/OrganizationInvite/OrganizationInvite'
import { BASE_PATH } from 'lib/constants'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import type { NextPageWithLayout } from 'types'
import { cn } from 'ui'

const JoinOrganizationPage: NextPageWithLayout = () => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use default during SSR to avoid hydration mismatch
  // Update to resolvedTheme after mount
  const isDarkMode = mounted && resolvedTheme?.includes('dark')

  const imgUrl = useMemo(
    () =>
      isDarkMode ? `${BASE_PATH}/img/supabase-dark.svg` : `${BASE_PATH}/img/supabase-light.svg`,
    [isDarkMode]
  )

  return (
    <>
      <Link href="/projects" className="flex items-center justify-center gap-4">
        {mounted && (
          <img src={imgUrl} alt="BA" className="block h-[24px] cursor-pointer rounded" />
        )}
      </Link>
      <OrganizationInvite />
    </>
  )
}

JoinOrganizationPage.getLayout = (page) => (
  <div
    className={cn(
      'flex h-full min-h-screen bg-studio',
      'w-full flex-col place-items-center',
      'items-center justify-center gap-8 px-5'
    )}
  >
    {page}
  </div>
)

export default JoinOrganizationPage
