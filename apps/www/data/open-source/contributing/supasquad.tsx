import { Image } from 'ui'

export const data = {
  metadata: {
    metaTitle: 'SupaSquad - BA advocate program',
    metaDescription:
      'The SupaSquad is an official BA advocate program where community members help build and manage the BA community.',
  },
  heroSection: {
    id: 'hero',
    title: 'Join the squad',
    h1: <>Become a Cornerstone of the BA Community</>,
    subheader: [
      <>
        Join passionate contributors to shape the entire BA experience. From helping
        developers solve problems to hosting events, advocating on social channels, and creating
        content, find your way to make a meaningful impact.
      </>,
    ],
    image: (
      <Image
        src={{
          dark: '/images/solutions/beginners/beginners-hero-dark.svg',
          light: '/images/solutions/beginners/beginners-hero-light.svg',
        }}
        alt="BA for Beginners"
        className="not-sr-only"
        width={1000}
        height={1000}
      />
    ),
    ctas: [
      {
        label: 'Learn how to join',
        href: '#why-supasquad',
        type: 'primary' as any,
      },
    ],
  },
  quotes: {
    id: 'quotes',
    items: [
      {
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        author: 'Sarah Chen',
        authorTitle: 'SupaSquad Helper',
        quote: (
          <>
            Being a Helper in SupaSquad has been incredibly rewarding. There's nothing like that
            moment when you help someone solve a problem they've been stuck on for hours.{' '}
            <span className="text-foreground">The community is so supportive</span>, and I've
            learned so much by helping others work through challenges I haven't faced myself.
          </>
        ),
      },
      {
        avatar:
          'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        author: 'Marcus Torres',
        authorTitle: 'SupaSquad Advocate',
        quote: (
          <>
            As an Advocate, I get to share my genuine excitement about BA with the broader
            developer community.{' '}
            <span className="text-foreground">
              It's amazing to see developers discover how much faster they can build
            </span>{' '}
            when they don't have to worry about backend complexity.
          </>
        ),
      },
      {
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        author: 'Alex Kim',
        authorTitle: 'SupaSquad Maintainer',
        quote: (
          <>
            Contributing as a Maintainer has accelerated my growth as a developer more than any
            course could.
            <span className="text-foreground">
              Working directly with the core team on real production code
            </span>{' '}
            has given me insights I never would have gained otherwise.
          </>
        ),
      },
    ],
  },
  why: {
    id: 'why-supasquad',
    label: '',
    heading: (
      <>
        Contribute in the way that best fits your{' '}
        <span className="text-foreground">unique skills</span>
      </>
    ),
    subheading:
      "We recognize that every contributor brings unique strengths, which is why we've created four distinct tracks to match how you want to make an impact. You can join one or multiple tracks based on your interests and skills.",
    features: [
      {
        id: 'contributor',
        icon: 'life-buoy',
        heading: 'Contributor',
        subheading:
          'Support the BA community by sharing expertise, improving docs, answering questions, and keeping our spaces welcoming and productive.',
      },
      {
        id: 'content-creator',
        icon: 'video',
        heading: 'Content Creator',
        subheading:
          'Make BA shine through videos, blogs, tutorials, and other content that educates and inspires developers.',
      },
      {
        id: 'trusted-host',
        icon: 'users',
        heading: 'Trusted Host',
        subheading:
          'Run high-quality BA meetups that bring developers together and grow strong local communities.',
      },
      {
        id: 'event-speaker',
        icon: 'mic',
        heading: 'Event Speaker',
        subheading:
          'Represent BA at developer events by sharing insights, telling great stories, and showcasing what builders can create.',
      },
    ],
  },
  benefits: {
    id: 'benefits',
    heading: <span className="text-foreground">Benefits for our members</span>,
    subheading:
      'Contributing to SupaSquad comes with real benefits. From community recognition to exclusive perks, we value your time and impact.',
    features: [
      {
        id: 'community-recognition',
        heading: 'Community Recognition',
        subheading:
          'Get a Badge on Discord and flair on Reddit showcasing your SupaSquad status in the community.',

        icon: 'award',
      },
      {
        id: 'early-access',
        heading: 'Early Access',
        subheading:
          'Get first access to new BA features and provide feedback directly to our team.',
        icon: 'zap',
      },
      {
        id: 'direct-team-access',
        heading: 'Direct Team Access',
        subheading:
          'Direct communication channel with BA team members for questions, suggestions and support.',
        icon: 'message-square',
      },
      {
        id: 'partner-deals',
        heading: 'Partner Deals',
        subheading:
          'Exclusive discounts and benefits on leading developer tools, AI platforms, and lifestyle brands.',
        icon: 'tag',
      },
      {
        id: 'exclusive-swag',
        heading: 'Exclusive SWAG',
        subheading:
          'Special BA merchandise reserved for SupaSquad members. Show your status with pride.',
        icon: 'gift',
      },
      {
        id: 'growth-opportunities',
        heading: 'Growth Opportunities',
        subheading:
          'Room to grow from volunteer to paid contributor to paid employee. Your path in the BA ecosystem.',
        icon: 'trending-up',
      },
    ],
  },
  ctaSection: {
    id: 'cta',
    title: 'Ready to make an impact?',
    primaryCta: {
      label: 'Apply to Join SupaSquad',
      url: process.env.NEXT_PUBLIC_SUPASQUAD_APPLICATION_FORM_URL || '#',
      type: 'primary' as any,
    },
  },
}
