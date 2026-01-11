'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useState } from 'react'
import { useWindowSize } from 'react-use'

import { useIsLoggedIn, useUser } from 'common'
import { Button, buttonVariants, cn } from 'ui'
import { AuthenticatedDropdownMenu } from 'ui-patterns'

import HamburgerButton from './HamburgerMenu'
import RightClickBrandLogo from './RightClickBrandLogo'
import useDropdownMenu from './useDropdownMenu'

import { getMenu } from 'data/nav'
import { usePathname } from 'next/navigation'

const MenuItem = dynamic(() => import('./MenuItem'), { ssr: false })
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
const NavigationMenu = dynamic(
  () => import('ui/src/components/shadcn/ui/navigation-menu').then((mod) => mod.NavigationMenu),
  { ssr: false }
)
const NavigationMenuContent = dynamic(
  () => import('ui/src/components/shadcn/ui/navigation-menu').then((mod) => mod.NavigationMenuContent),
  { ssr: false }
)
const NavigationMenuItem = dynamic(
  () => import('ui/src/components/shadcn/ui/navigation-menu').then((mod) => mod.NavigationMenuItem),
  { ssr: false }
)
const NavigationMenuLink = dynamic(
  () => import('ui/src/components/shadcn/ui/navigation-menu').then((mod) => mod.NavigationMenuLink),
  { ssr: false }
)
const NavigationMenuList = dynamic(
  () => import('ui/src/components/shadcn/ui/navigation-menu').then((mod) => mod.NavigationMenuList),
  { ssr: false }
)
const NavigationMenuTrigger = dynamic(
  () => import('ui/src/components/shadcn/ui/navigation-menu').then((mod) => mod.NavigationMenuTrigger),
  { ssr: false }
)
const ScrollProgress = dynamic(() => import('components/ScrollProgress'), { ssr: false })

interface Props {
  hideNavbar: boolean
  stickyNavbar?: boolean
}

const Nav = ({ hideNavbar, stickyNavbar = true }: Props) => {
  const pathname = usePathname()
  const { width } = useWindowSize()
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const isLoggedIn = useIsLoggedIn()
  const menu = getMenu()
  const user = useUser()
  const userMenu = useDropdownMenu(user)

  const isLaunchWeekXPage = pathname === '/launch-week/x'
  const isLaunchWeek12Page = pathname === '/launch-week/12'
  const isLaunchWeek13Page = pathname === '/launch-week/13'
  const isGAWeekSection = pathname?.startsWith('/ga-week')
  const disableStickyNav =
    isLaunchWeekXPage ||
    isGAWeekSection ||
    isLaunchWeekXPage ||
    isLaunchWeek12Page ||
    isLaunchWeek13Page ||
    !stickyNavbar
  const showLaunchWeekNavMode = (isGAWeekSection || isLaunchWeekXPage) && !open

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      // Prevent scrolling on mount
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  // Close mobile menu when desktop (only after mount to prevent hydration mismatch)
  React.useEffect(() => {
    if (isMounted && width >= 1024) setOpen(false)
  }, [width, isMounted])

  return hideNavbar ? null : (
    <>
      <div
        className={cn('sticky top-0 z-40 transform', disableStickyNav && 'relative')}
        style={{ transform: 'translate3d(0,0,999px)' }}
        suppressHydrationWarning
      >
        <div
          className={cn(
            'absolute inset-0 h-full w-full bg-background/90 dark:bg-background/95',
            !showLaunchWeekNavMode && '!opacity-100 transition-opacity',
            showLaunchWeekNavMode && '!bg-transparent dark:!bg-black transition-all',
            isGAWeekSection && 'dark:!bg-alternative'
          )}
          suppressHydrationWarning
        />
        <nav
          className={cn(
            `relative z-40 border-default border-b backdrop-blur-sm transition-opacity`,
            showLaunchWeekNavMode && 'border-muted border-b bg-transparent'
          )}
          suppressHydrationWarning
        >
          <div className="relative flex justify-between h-16 mx-auto lg:container lg:px-16 xl:px-20" suppressHydrationWarning>
            <div className="flex items-center px-6 lg:px-0 flex-1 sm:items-stretch justify-between" suppressHydrationWarning>
              <div className="flex items-center" suppressHydrationWarning>
                <div className="flex items-center flex-shrink-0">
                  <RightClickBrandLogo />
                </div>
                <NavigationMenu
                  delayDuration={0}
                  className="hidden pl-8 sm:space-x-4 lg:flex h-16"
                  viewportClassName="rounded-xl bg-background"
                  suppressHydrationWarning
                >
                  <NavigationMenuList>
                    {menu.primaryNav.map((menuItem) =>
                      menuItem.hasDropdown ? (
                        <NavigationMenuItem className="text-sm font-medium" key={menuItem.title}>
                          <NavigationMenuTrigger
                            className={cn(
                              buttonVariants({ type: 'text', size: 'small' }),
                              '!bg-transparent hover:text-brand-link data-[state=open]:!text-brand-link data-[radix-collection-item]:focus-visible:ring-2 data-[radix-collection-item]:focus-visible:ring-foreground-lighter data-[radix-collection-item]:focus-visible:text-foreground px-2 h-auto'
                            )}
                          >
                            {menuItem.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>{menuItem.dropdown}</NavigationMenuContent>
                        </NavigationMenuItem>
                      ) : (
                        <NavigationMenuItem className="text-sm font-medium" key={menuItem.title}>
                          <NavigationMenuLink asChild>
                            <MenuItem
                              href={menuItem.url}
                              title={menuItem.title}
                              className="group-hover:bg-transparent text-foreground focus-visible:text-brand-link"
                              hoverColor="brand"
                            />
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      )
                    )}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <div className="flex items-center gap-2 opacity-0 animate-fade-in !scale-100 delay-300" suppressHydrationWarning>
                {isLoggedIn ? (
                  <>
                    <Button className="hidden lg:block" asChild>
                      <Link href="/dashboard/projects">Dashboard</Link>
                    </Button>
                    <AuthenticatedDropdownMenu menu={userMenu} user={user} site="www" />
                  </>
                ) : (
                  <>
                    <Button type="default" className="hidden lg:block" asChild>
                      <Link
                        href="https://www.assistance.bg/dashboard"
                      >
                        Sign in
                      </Link>
                    </Button>
                    <Button className="hidden lg:block" asChild>
                      <Link
                        href="https://www.assistance.bg/dashboard"
                      >
                        Start your project
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <HamburgerButton
              toggleFlyOut={() => setOpen(true)}
              showLaunchWeekNavMode={showLaunchWeekNavMode}
            />
          </div>
          <MobileMenu open={open} setOpen={setOpen} menu={menu} />
        </nav>

        <ScrollProgress />
      </div>
    </>
  )
}

export default Nav
