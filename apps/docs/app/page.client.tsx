'use client'

import Link from 'next/link'
import { cn } from 'ui'
import { isFeatureEnabled } from 'common/enabled-features'
import MenuIconPicker from '~/components/Navigation/NavigationMenu/MenuIconPicker'
import { MIGRATION_PAGES } from '~/components/Navigation/NavigationMenu/NavigationMenu.constants'
import { GlassPanelWithIconPicker } from '~/features/ui/GlassPanelWithIconPicker'
import { IconPanelWithIconPicker } from '~/features/ui/IconPanelWithIconPicker'
import { IconBackground, TextLink } from 'ui'

interface PageContentProps {
  products: any[]
  postgresIntegrations: any[]
  selfHostingOptions: any[]
  additionalResources: any[]
}

export const HomePageContent = ({ products, postgresIntegrations, selfHostingOptions, additionalResources }: PageContentProps) => {
  const { sdkCsharp, sdkDart, sdkKotlin, sdkPython, sdkSwift } = isFeatureEnabled([
    'sdk:csharp',
    'sdk:dart',
    'sdk:kotlin',
    'sdk:python',
    'sdk:swift',
  ])

  const clientLibraries = [
    {
      title: 'Javascript',
      icon: 'reference-javascript',
      href: '/reference/javascript/introduction',
      enabled: true,
    },
    {
      title: 'Flutter',
      icon: 'reference-dart',
      href: '/reference/dart/introduction',
      enabled: sdkDart,
    },
    {
      title: 'Python',
      icon: 'reference-python',
      href: '/reference/python/introduction',
      enabled: sdkPython,
    },
    {
      title: 'C#',
      icon: 'reference-csharp',
      href: '/reference/csharp/introduction',
      enabled: sdkCsharp,
    },
    {
      title: 'Swift',
      icon: 'reference-swift',
      href: '/reference/swift/introduction',
      enabled: sdkSwift,
    },
    {
      title: 'Kotlin',
      icon: 'reference-kotlin',
      href: '/reference/kotlin/introduction',
      enabled: sdkKotlin,
    },
  ]

  return (
    <div className="flex flex-col">
      <h2 id="products">Products</h2>
      <ul className="grid grid-cols-12 gap-6 not-prose [&_svg]:text-brand-600">
        {products.map((product) => {
          return (
            <li key={product.title} className={cn(product.span ?? 'col-span-12 md:col-span-4')}>
              <Link href={product.href} passHref>
                <GlassPanelWithIconPicker {...product}>
                  {product.description}
                </GlassPanelWithIconPicker>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col lg:grid grid-cols-12 gap-6 py-12 border-b">
        <div className="col-span-4">
          <h2 id="postgres-integrations" className="scroll-mt-24 m-0">
            Postgres Modules
          </h2>
        </div>
        <div className="grid col-span-8 grid-cols-12 gap-6 not-prose">
          {postgresIntegrations.map((integration) => (
            <Link
              href={integration.href}
              key={integration.title}
              passHref
              className="col-span-6 md:col-span-4"
            >
              <IconPanelWithIconPicker {...integration} />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:grid grid-cols-12 gap-6 py-12 border-b">
        <div className="col-span-4 flex flex-col gap-1 [&_h2]:m-0 [&_h3]:m-0">
          <div className="md:max-w-xs 2xl:max-w-none">
            <div className="flex items-center gap-3 mb-3 text-brand-600">
              <h2 id="client-libraries" className="group scroll-mt-24">
                Client Libraries
              </h2>
            </div>
          </div>
        </div>

        <div className="grid col-span-8 grid-cols-12 gap-6 not-prose">
          {clientLibraries
            .filter((library) => library.enabled)
            .map((library) => {
              return (
                <Link
                  href={library.href}
                  key={library.title}
                  passHref
                  className="col-span-6 md:col-span-4"
                >
                  <IconPanelWithIconPicker {...library} />
                </Link>
              )
            })}
        </div>
      </div>
      {isFeatureEnabled('docs:full_getting_started') && (
        <div className="flex flex-col lg:grid grid-cols-12 gap-6 py-12 border-b">
          <div className="col-span-4 flex flex-col gap-1 [&_h2]:m-0">
            <h2 id="migrate-to-supabase" className="group scroll-mt-24">
              Migrate to BA
            </h2>
            <p className="text-foreground-light text-sm p-0 m-0">
              Bring your existing data, auth and storage to BA following our migration guides.
            </p>
            <TextLink
              label="Explore more resources"
              url="/guides/resources"
              className="no-underline text-brand-link text-sm"
            />
          </div>

          <ul className="grid col-span-8 grid-cols-12 gap-6 not-prose">
            {MIGRATION_PAGES.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(
              (guide) => {
                return (
                  <li key={guide.name} className="col-span-6 md:col-span-4">
                    <Link href={guide.url || '#'} passHref>
                      <GlassPanelWithIconPicker
                        {...(guide as any)}
                        title={guide.name || ''}
                        background={true}
                        showLink={false}
                      />
                    </Link>
                  </li>
                )
              }
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-6 py-12 border-b">
        <div className="col-span-4 flex flex-col gap-1 [&_h2]:m-0 [&_h3]:m-0">
          <h3 id="additional-resources" className="group scroll-mt-24">
            Additional resources
          </h3>
        </div>

        <ul className="grid grid-cols-12 gap-6 not-prose">
          {additionalResources.map((resource) => {
            return (
              <li key={resource.title} className="col-span-12 md:col-span-6 lg:col-span-3">
                <Link
                  href={resource.href}
                  className="col-span-12 md:col-span-6 lg:col-span-3"
                  passHref
                  target={resource.external ? '_blank' : undefined}
                >
                  <GlassPanelWithIconPicker {...resource} background={false}>
                    {resource.description}
                  </GlassPanelWithIconPicker>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      {isFeatureEnabled('docs:full_getting_started') && (
        <div className="flex flex-col lg:grid grid-cols-12 gap-6 py-12">
          <div className="col-span-4 flex flex-col gap-1 [&_h2]:m-0 [&_h3]:m-0">
            <div className="md:max-w-xs 2xl:max-w-none">
              <div className="flex items-center gap-3 mb-3 text-brand-600">
                <IconBackground>
                  <MenuIconPicker icon="self-hosting" width={18} height={18} />
                </IconBackground>
                <h3 id="self-hosting" className="group scroll-mt-24">
                  Self-Hosting
                </h3>
              </div>
              <p className="text-foreground-light text-sm">
                Get started with self-hosting BA.
              </p>
              <TextLink
                label="More on Self-Hosting"
                url="/guides/self-hosting"
                className="no-underline text-brand-link text-sm"
              />
            </div>
          </div>

          <div className="grid col-span-8 grid-cols-12 gap-6 not-prose">
            <ul className="col-span-full lg:col-span-8 grid grid-cols-12 gap-6">
              {selfHostingOptions.map((option) => {
                return (
                  <li key={option.title} className="col-span-6">
                    <Link href={option.href} passHref>
                      <IconPanelWithIconPicker {...option} background={true} showLink={false} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
