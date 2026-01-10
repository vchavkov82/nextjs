export const siteConfig = {
  name: 'BA Design System',
  url: 'https://www.assistance.bg/design-system',
  ogImage: 'https://www.assistance.bg/design-system/og.jpg',
  description: 'Design System of BA',
  links: {
    twitter: 'https://twitter.com/supabase',
    github: 'https://github.com/vchavkov82/nextjs/tree/master/apps/design-system',
    credits: {
      radix: 'https://www.radix-ui.com/themes/docs/overview/getting-started',
      shadcn: 'https://ui.shadcn.com/',
      geist: 'https://vercel.com/geist/introduction',
    },
  },
}

export type SiteConfig = typeof siteConfig
