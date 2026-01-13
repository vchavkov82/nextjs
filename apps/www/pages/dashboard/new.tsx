import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import DefaultLayout from '@/components/Layouts/Default'
import { Button } from 'ui'

export default function DashboardNewPage() {
  const router = useRouter()
  const { plan } = router.query

  const meta_title = 'Create New Project | BA'
  const meta_description = 'Create a new BA project and start building your application.'

  // Redirect to the actual dashboard with the plan parameter
  useEffect(() => {
    if (router.isReady && plan) {
      const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL || 'https://app.www.assistance.bg'
      const redirectUrl = `${studioUrl}/new?plan=${plan}`
      window.location.href = redirectUrl
    } else if (router.isReady) {
      // If no plan parameter, redirect to dashboard
      const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL || 'https://app.www.assistance.bg'
      window.location.href = `${studioUrl}/new`
    }
  }, [router.isReady, plan])

  return (
    <DefaultLayout>
      <NextSeo
        title={meta_title}
        description={meta_description}
        openGraph={{
          title: meta_title,
          description: meta_description,
          url: `https://www.assistance.bg/dashboard/new${plan ? `?plan=${plan}` : ''}`,
          images: [
            {
              url: `https://www.assistance.bg/images/og/supabase-og.png`,
            },
          ],
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="mx-auto max-w-2xl px-8 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-8">
            <h1 className="h1">Creating your project...</h1>
            <p className="p text-lg leading-5 text-muted-foreground">
              {plan
                ? `Setting up your ${plan} plan project. You'll be redirected shortly.`
                : 'Setting up your new project. You'll be redirected shortly.'}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                type="default"
                onClick={() => {
                  const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL || 'https://app.www.assistance.bg'
                  const redirectUrl = plan ? `${studioUrl}/new?plan=${plan}` : `${studioUrl}/new`
                  window.location.href = redirectUrl
                }}
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
