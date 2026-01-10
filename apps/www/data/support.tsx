import { ArrowUpRight } from 'lucide-react'
import { IconDiscord, IconDiscussions, IconGitHubSolid } from 'ui'

const data = {
  meta_title: 'Help & Support | BA',
  meta_description:
    'Find help and support for BA. Our Support team provide answers on all types of issues, including account information, billing, and refunds.',
  hero: {
    h1: 'Support',
    title: 'Hello, how can we help?',
  },
  cards: [
    {
      title: 'Community support',
      paragraph:
        'Our Discord community can help with code-related issues. Many questions are answered in minutes.',
      links: [
        {
          label: 'Join us on Discord',
          link: 'https://discord.supabase.com/',
          target: '_blank',
          icon: <IconDiscord fill="hsl(var(--background-default))" />,
          type: 'secondary',
        },
      ],
      className: 'col-span-full xl:col-span-1',
    },
    {
      title: 'Issues',
      paragraph: 'Found a bug? We’d love to hear about it in our GitHub issues.',
      links: [
        {
          label: 'Report an issue',
          link: 'https://github.com/vchavkov82/nextjs/issues',
          target: '_blank',
          icon: <IconGitHubSolid />,
          type: 'default',
        },
      ],
    },
    {
      title: 'Feature requests',
      paragraph: 'Want to suggest a new feature? Share it with us on GitHub discussions.',
      links: [
        {
          label: 'Suggest a feature',
          link: 'https://github.com/orgs/supabase/discussions/categories/feature-requests',
          target: '_blank',
          icon: <IconDiscussions />,
          type: 'default',
        },
      ],
    },
  ],
  banner: {
    title: 'Can’t find what you’re looking for?',
    paragraph: (
      <>
        <p className="text-foreground-light">The BA Support Team is ready to help.</p>
        <p className="text-foreground-lighter text-sm">
          Response time for support tickets will vary depending on plan type and severity of the
          issue.
        </p>
      </>
    ),
    links: [
      {
        label: 'Contact enterprise sales',
        link: 'https://forms.supabase.com/enterprise',
        target: '_blank',
        type: 'default',
      },
      {
        label: 'Open support ticket',
        link: 'https://www.assistance.bg/dashboard/support/new',
        target: '_blank',
        icon: <ArrowUpRight />,
        className: '!text-foreground-light hover:!text-foreground',
        type: 'text',
      },
    ],
  },
}

export default data
