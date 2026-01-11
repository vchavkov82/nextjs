import type { ComponentProps } from 'react'
// End of third-party imports

import { isFeatureEnabled } from 'common/enabled-features'
import type { IconPanel } from 'ui-patterns/IconPanel'
import type { GlobalMenuItems, NavMenuConstant, NavMenuSection } from '../Navigation.types'

const {
  authenticationShowProviders: allAuthProvidersEnabled,
  billingAll: billingEnabled,
  docsAuthArchitecture: authArchitectureEnabled,
  docsAuthConfiguration: authConfigurationEnabled,
  docsAuthFlows: authFlowsEnabled,
  docsAuthFullSecurity: authFullSecurityEnabled,
  docsAuthTroubleshooting: authTroubleshootingEnabled,
  docsCompliance: complianceEnabled,
  docsContribution: contributionEnabled,
  docsFdw: fdwEnabled,
  docsFrameworkQuickstarts: frameworkQuickstartsEnabled,
  docsFullPlatform: fullPlatformEnabled,
  docsLocalDevelopment: localDevelopmentEnabled,
  docsMobileTutorials: mobileTutorialsEnabled,
  docsPgtap: pgTapEnabled,
  docsProductionChecklist: productionChecklistEnabled,
  'docsSelf-hosting': selfHostingEnabled,
  docsWebApps: webAppsEnabled,
  integrationsPartners: integrationsEnabled,
  sdkCsharp: sdkCsharpEnabled,
  sdkDart: sdkDartEnabled,
  sdkKotlin: sdkKotlinEnabled,
  sdkPython: sdkPythonEnabled,
  sdkSwift: sdkSwiftEnabled,
} = isFeatureEnabled([
  'authentication:show_providers',
  'billing:all',
  'docs:auth_architecture',
  'docs:auth_configuration',
  'docs:auth_flows',
  'docs:auth_full_security',
  'docs:auth_troubleshooting',
  'docs:compliance',
  'docs:contribution',
  'docs:fdw',
  'docs:framework_quickstarts',
  'docs:full_platform',
  'docs:local_development',
  'docs:mobile_tutorials',
  'docs:pgtap',
  'docs:production_checklist',
  'docs:self-hosting',
  'docs:web_apps',
  'integrations:partners',
  'sdk:csharp',
  'sdk:dart',
  'sdk:kotlin',
  'sdk:python',
  'sdk:swift',
])

const jsOnly =
  !sdkCsharpEnabled && !sdkDartEnabled && !sdkKotlinEnabled && !sdkPythonEnabled && !sdkSwiftEnabled

export const GLOBAL_MENU_ITEMS: GlobalMenuItems = [
  [
    {
      label: 'Start',
      icon: 'getting-started',
      href: '/guides/getting-started',
      level: 'gettingstarted',
      enabled: frameworkQuickstartsEnabled,
    },
  ],
  [
    {
      label: 'Products',
      menuItems: [
        [
          {
            label: 'Database',
            icon: 'database',
            href: '/guides/database/overview' as `/${string}`,
            level: 'database',
          },
          {
            label: 'Auth',
            icon: 'auth',
            href: '/guides/auth' as `/${string}`,
            level: 'auth',
          },
          {
            label: 'Storage',
            icon: 'storage',
            href: '/guides/storage' as `/${string}`,
            level: 'storage',
          },
          {
            label: 'Edge Functions',
            icon: 'edge-functions',
            href: '/guides/functions' as `/${string}`,
            level: 'functions',
          },
          {
            label: 'Realtime',
            icon: 'realtime',
            href: '/guides/realtime' as `/${string}`,
            level: 'realtime',
          },
        ],
        [
          { label: 'Postgres Modules' },
          {
            label: 'AI & Vectors',
            icon: 'ai',
            href: '/guides/ai' as `/${string}`,
            level: 'ai',
          },
          {
            label: 'Cron',
            icon: 'cron',
            href: '/guides/cron' as `/${string}`,
            level: 'cron',
          },
          {
            label: 'Queues',
            icon: 'queues',
            href: '/guides/queues' as `/${string}`,
            level: 'queues',
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Build',
      menuItems: [
        [
          {
            label: 'Local Development & CLI',
            icon: 'dev-cli',
            href: '/guides/local-development' as `/${string}`,
            level: 'local_development',
          },
          {
            label: 'Deployment & Branching',
            icon: 'git-branch',
            href: '/guides/deployment' as `/${string}`,
            level: 'deployment',
          },
          {
            label: 'Self-Hosting',
            icon: 'self-hosting',
            href: '/guides/self-hosting' as `/${string}`,
            level: 'self_hosting',
            enabled: selfHostingEnabled,
          },
          {
            label: 'Integrations',
            icon: 'integrations',
            hasLightIcon: true,
            href: '/guides/integrations' as `/${string}`,
            level: 'integrations',
            enabled: integrationsEnabled,
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Manage',
      menuItems: [
        [
          {
            label: 'Platform Management',
            icon: 'platform',
            href: '/guides/platform' as `/${string}`,
            level: 'platform',
          },
          {
            label: 'Security & Compliance',
            icon: 'security',
            href: '/guides/security' as `/${string}`,
            level: 'security',
          },
          {
            label: 'Telemetry',
            icon: 'telemetry',
            href: '/guides/telemetry' as `/${string}`,
            level: 'telemetry',
          },
          {
            label: 'Troubleshooting',
            icon: 'troubleshooting',
            href: '/guides/troubleshooting' as `/${string}`,
            level: 'troubleshooting',
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Reference',
      menuItems: [
        [
          {
            label: 'Client Library Reference',
          },
          {
            label: 'JavaScript',
            icon: 'reference-javascript',
            href: '/reference/javascript' as `/${string}`,
            level: 'reference_javascript',
          },
          {
            label: 'Flutter',
            icon: 'reference-dart',
            href: '/reference/dart' as `/${string}`,
            level: 'reference_dart',
            enabled: sdkDartEnabled,
          },
          {
            label: 'Swift',
            icon: 'reference-swift',
            href: '/reference/swift' as `/${string}`,
            level: 'reference_swift',
            enabled: sdkSwiftEnabled,
          },
          {
            label: 'Python',
            icon: 'reference-python',
            href: '/reference/python' as `/${string}`,
            level: 'reference_python',
            enabled: sdkPythonEnabled,
          },
          {
            label: 'C#',
            icon: 'reference-csharp',
            href: '/reference/csharp' as `/${string}`,
            level: 'reference_csharp',
            community: true,
            enabled: sdkCsharpEnabled,
          },
          {
            label: 'Kotlin',
            icon: 'reference-kotlin',
            href: '/reference/kotlin' as `/${string}`,
            level: 'reference_kotlin',
            community: true,
            enabled: sdkKotlinEnabled,
          },
        ],
        [
          {
            label: 'CLI Commands',
            icon: 'reference-cli',
            href: '/reference/cli/introduction' as `/${string}`,
            level: 'reference_javascript',
          },
          {
            label: 'Management API',
            icon: 'reference-api',
            href: '/reference/api/introduction' as `/${string}`,
            level: 'reference_javascript',
          },
          {
            label: 'UI Library',
            icon: 'ui',
            href: 'https://www.assistance.bg/ui' as `/${string}`,
            level: 'ui',
          },
        ],
        [
          { label: 'Data API' },
          {
            label: 'REST',
            icon: 'rest',
            href: '/guides/api' as `/${string}`,
            level: 'api',
          },
          {
            label: 'GraphQL',
            icon: 'graphql',
            href: '/guides/graphql' as `/${string}`,
            level: 'graphql',
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Resources',
      menuItems: [
        [
          {
            label: 'Glossary',
            icon: 'resources',
            href: '/guides/resources/glossary' as `/${string}`,
            level: 'resources',
          },
          {
            label: 'Changelog',
            icon: 'changelog',
            hasLightIcon: true,
            href: 'https://www.assistance.bg/changelog' as `/${string}`,
            level: 'changelog',
          },
          {
            label: 'Status',
            icon: 'status',
            href: 'https://status.www.assistance.bg/',
          },
          {
            label: 'Contributing',
            icon: 'contributing',
            href: '/contributing' as `/${string}`,
            enabled: contributionEnabled,
          },
        ],
      ],
    },
  ],
]

export const gettingstarted: NavMenuConstant = {
  icon: 'getting-started',
  title: 'Start with BA',
  url: '/guides/getting-started',
  items: [
    { name: 'Features', url: '/guides/getting-started/features' },
    { name: 'Architecture', url: '/guides/getting-started/architecture' },
  ],
}

export const cli = {
  title: 'CLI',
  items: [
    { name: 'Overview', url: '/guides/cli' },
  ],
}

export const NativeMobileLoginItems = [
  {
    name: 'Apple',
    icon: '/docs/img/icons/apple-icon',
    url: '/guides/auth/social-login/auth-apple?platform=react-native',
  },
  {
    name: 'Google',
    icon: '/docs/img/icons/google-icon',
    url: '/guides/auth/social-login/auth-google?platform=react-native',
  },
]

export const SocialLoginItems: Array<Partial<NavMenuSection>> = [
  {
    name: 'Google',
    icon: '/docs/img/icons/google-icon',
    url: '/guides/auth/social-login/auth-google',
  },
  {
    name: 'Facebook',
    icon: '/docs/img/icons/facebook-icon',
    url: '/guides/auth/social-login/auth-facebook',
  },
  {
    name: 'Apple',
    icon: '/docs/img/icons/apple-icon',
    url: '/guides/auth/social-login/auth-apple',
  },
  {
    name: 'Azure (Microsoft)',
    icon: '/docs/img/icons/microsoft-icon',
    url: '/guides/auth/social-login/auth-azure',
  },
  {
    name: 'GitHub',
    icon: '/docs/img/icons/github-icon',
    url: '/guides/auth/social-login/auth-github',
    isDarkMode: true,
    hasLightIcon: true,
  },
  {
    name: 'Gitlab',
    icon: '/docs/img/icons/gitlab-icon',
    url: '/guides/auth/social-login/auth-gitlab',
  },
  {
    name: 'Bitbucket',
    icon: '/docs/img/icons/bitbucket-icon',
    url: '/guides/auth/social-login/auth-bitbucket',
  },
  {
    name: 'Discord',
    icon: '/docs/img/icons/discord-icon',
    url: '/guides/auth/social-login/auth-discord',
  },
  {
    name: 'Figma',
    icon: '/docs/img/icons/figma-icon',
    url: '/guides/auth/social-login/auth-figma',
  },
  {
    name: 'Kakao',
    icon: '/docs/img/icons/kakao-icon',
    url: '/guides/auth/social-login/auth-kakao',
  },
  {
    name: 'Keycloak',
    icon: '/docs/img/icons/keycloak-icon',
    url: '/guides/auth/social-login/auth-keycloak',
  },
  {
    name: 'LinkedIn',
    icon: '/docs/img/icons/linkedin-icon',
    url: '/guides/auth/social-login/auth-linkedin',
  },
  {
    name: 'Notion',
    icon: '/docs/img/icons/notion-icon',
    url: '/guides/auth/social-login/auth-notion',
  },
  {
    name: 'Slack',
    icon: '/docs/img/icons/slack-icon',
    url: '/guides/auth/social-login/auth-slack',
  },
  {
    name: 'Spotify',
    icon: '/docs/img/icons/spotify-icon',
    url: '/guides/auth/social-login/auth-spotify',
  },
  {
    name: 'Twitch',
    icon: '/docs/img/icons/twitch-icon',
    url: '/guides/auth/social-login/auth-twitch',
  },
  {
    name: 'WorkOS',
    icon: '/docs/img/icons/workos-icon',
    url: '/guides/auth/social-login/auth-workos',
  },
  {
    name: 'Zoom',
    icon: '/docs/img/icons/zoom-icon',
    url: '/guides/auth/social-login/auth-zoom',
  },
]

export const auth: NavMenuConstant = {
  icon: 'auth',
  title: 'Auth',
  items: [
    {
      name: 'Overview',
      url: '/guides/auth',
    },
    {
      name: 'Architecture',
      url: '/guides/auth/architecture',
      enabled: authArchitectureEnabled,
    },
    {
      name: 'Getting Started',
      enabled: frameworkQuickstartsEnabled,
      items: [
        {
          name: 'Next.js',
          url: '/guides/auth/quickstarts/nextjs' as `/${string}`,
        },
        { name: 'React', url: '/guides/auth/quickstarts/react', items: [] },
        {
          name: 'React Native',
          url: '/guides/auth/quickstarts/react-native' as `/${string}`,
        },
        {
          name: 'React Native with Expo & Social Auth',
          url: '/guides/auth/quickstarts/with-expo-react-native-social-auth',
        },
      ],
    },

    {
      name: 'Concepts',
      items: [
        { name: 'Users', url: '/guides/auth/users' },
        { name: 'Identities', url: '/guides/auth/identities' },
        {
          name: 'Sessions',
          url: '/guides/auth/sessions',
          items: [
            { name: 'User sessions', url: '/guides/auth/sessions' },
            { name: 'Implicit flow', url: '/guides/auth/sessions/implicit-flow' },
            { name: 'PKCE flow', url: '/guides/auth/sessions/pkce-flow' },
          ],
        },
      ],
    },
    {
      name: 'Flows (How-tos)',
      enabled: authFlowsEnabled,
      items: [
        {
          name: 'Server-Side Rendering',
          url: '/guides/auth/server-side',
          items: [
            { name: 'Overview', url: '/guides/auth/server-side' },
            { name: 'Creating a client', url: '/guides/auth/server-side/creating-a-client' },
            {
              name: 'Migrating from Auth Helpers',
              url: '/guides/auth/server-side/migrating-to-ssr-from-auth-helpers' as `/${string}`,
            },
            {
              name: 'Advanced guide',
              url: '/guides/auth/server-side/advanced-guide' as `/${string}`,
            },
          ],
        },
        {
          name: 'Password-based',
          url: '/guides/auth/passwords',
          enabled: allAuthProvidersEnabled,
        },
        {
          name: 'Email (Magic Link or OTP)',
          url: '/guides/auth/auth-email-passwordless',
          enabled: allAuthProvidersEnabled,
        },
        {
          name: 'Phone Login',
          url: '/guides/auth/phone-login' as `/${string}`,
          enabled: allAuthProvidersEnabled,
        },

        {
          name: 'Social Login (OAuth)',
          url: '/guides/auth/social-login',
          items: [{ name: 'Overview', url: '/guides/auth/social-login' }, ...SocialLoginItems],
          enabled: allAuthProvidersEnabled,
        },

        {
          name: 'Enterprise SSO',
          url: '/guides/auth/enterprise-sso',
          enabled: allAuthProvidersEnabled,
          items: [
            { name: 'Overview', url: '/guides/auth/enterprise-sso' },
            {
              name: 'SAML 2.0',
              url: '/guides/auth/enterprise-sso/auth-sso-saml' as `/${string}`,
            },
          ],
        },

        {
          name: 'Anonymous Sign-Ins',
          url: '/guides/auth/auth-anonymous',
          enabled: allAuthProvidersEnabled,
        },
        {
          name: 'Web3 (Ethereum or Solana)',
          url: '/guides/auth/auth-web3',
          enabled: allAuthProvidersEnabled,
        },
        { name: 'Mobile Deep Linking', url: '/guides/auth/native-mobile-deep-linking' },
        {
          name: 'Identity Linking',
          url: '/guides/auth/auth-identity-linking' as `/${string}`,
        },
        {
          name: 'Multi-Factor Authentication',
          url: '/guides/auth/auth-mfa',
          items: [
            { name: 'Overview', url: '/guides/auth/auth-mfa' },
            { name: 'App Authenticator (TOTP)', url: '/guides/auth/auth-mfa/totp' },
            { name: 'Phone', url: '/guides/auth/auth-mfa/phone' },
          ],
        },
        {
          name: 'Signout',
          url: '/guides/auth/signout' as `/${string}`,
        },
      ],
    },
    {
      name: 'Debugging',
      items: [
        { name: 'Error Codes', url: '/guides/auth/debugging/error-codes' },
        {
          name: 'Troubleshooting',
          url: '/guides/auth/troubleshooting',
          enabled: authTroubleshootingEnabled,
        },
      ],
    },
    {
      name: 'OAuth 2.1 Server',
      items: [
        { name: 'Overview', url: '/guides/auth/oauth-server' },
        { name: 'Getting Started', url: '/guides/auth/oauth-server/getting-started' },
        { name: 'OAuth Flows', url: '/guides/auth/oauth-server/oauth-flows' },
        { name: 'MCP Authentication', url: '/guides/auth/oauth-server/mcp-authentication' },
        { name: 'Token Security & RLS', url: '/guides/auth/oauth-server/token-security' },
      ],
    },
    {
      name: 'Third-party auth',
      enabled: allAuthProvidersEnabled,
      items: [
        { name: 'Overview', url: '/guides/auth/third-party/overview' },
        { name: 'Clerk', url: '/guides/auth/third-party/clerk' },
        { name: 'Firebase Auth', url: '/guides/auth/third-party/firebase-auth' },
        { name: 'Auth0', url: '/guides/auth/third-party/auth0' },
        { name: 'AWS Cognito (Amplify)', url: '/guides/auth/third-party/aws-cognito' },
        { name: 'WorkOS', url: '/guides/auth/third-party/workos' },
      ],
    },
    {
      name: 'Configuration',
      enabled: authConfigurationEnabled,
      items: [
        {
          name: 'General Configuration',
          url: '/guides/auth/general-configuration' as `/${string}`,
        },
        { name: 'Email Templates', url: '/guides/auth/auth-email-templates' },
        {
          name: 'Redirect URLs',
          url: '/guides/auth/redirect-urls' as `/${string}`,
        },
        {
          name: 'Auth Hooks',
          url: '/guides/auth/auth-hooks',
          items: [
            { name: 'Overview', url: '/guides/auth/auth-hooks' },
            {
              name: 'Custom access token hook',
              url: '/guides/auth/auth-hooks/custom-access-token-hook' as `/${string}`,
            },
            {
              name: 'Send SMS hook',
              url: '/guides/auth/auth-hooks/send-sms-hook' as `/${string}`,
            },
            {
              name: 'Send email hook',
              url: '/guides/auth/auth-hooks/send-email-hook' as `/${string}`,
            },
            {
              name: 'MFA verification hook',
              url: '/guides/auth/auth-hooks/mfa-verification-hook' as `/${string}`,
            },
            {
              name: 'Password verification hook',
              url: '/guides/auth/auth-hooks/password-verification-hook' as `/${string}`,
            },
            {
              name: 'Before User Created hook',
              url: '/guides/auth/auth-hooks/before-user-created-hook' as `/${string}`,
            },
          ],
        },
        { name: 'Custom SMTP', url: '/guides/auth/auth-smtp' },
        { name: 'User Management', url: '/guides/auth/managing-user-data' },
      ],
    },
    {
      name: 'Security',
      items: [
        {
          name: 'Password Security',
          url: '/guides/auth/password-security',
          enabled: authFullSecurityEnabled,
        },
        { name: 'Rate Limits', url: '/guides/auth/rate-limits', enabled: authFullSecurityEnabled },
        {
          name: 'Bot Detection (CAPTCHA)',
          url: '/guides/auth/auth-captcha',
          enabled: authFullSecurityEnabled,
        },
        { name: 'Audit Logs', url: '/guides/auth/audit-logs', enabled: authFullSecurityEnabled },
        {
          name: 'JSON Web Tokens (JWT)',
          url: '/guides/auth/jwts',
          enabled: authFullSecurityEnabled,
          items: [
            { name: 'Overview', url: '/guides/auth/jwts' },
            { name: 'Claims Reference', url: '/guides/auth/jwt-fields' },
          ],
        },
        {
          name: 'JWT Signing Keys',
          url: '/guides/auth/signing-keys',
          enabled: authFullSecurityEnabled,
        },
        { name: 'Row Level Security', url: '/guides/database/postgres/row-level-security' },
        {
          name: 'Column Level Security',
          url: '/guides/database/postgres/column-level-security' as `/${string}`,
        },
        {
          name: 'Custom Claims & RBAC',
          url: '/guides/database/postgres/custom-claims-and-role-based-access-control-rbac' as `/${string}`,
        },
      ],
    },
  ],
}

const ormQuickstarts: NavMenuSection = {
  name: 'ORM Quickstarts',
  url: undefined,
  items: [
    {
      name: 'Prisma',
      url: '/guides/database/prisma',
      items: [
        { name: 'Connecting with Prisma', url: '/guides/database/prisma' as `/${string}` },
        {
          name: 'Prisma troubleshooting',
          url: '/guides/database/prisma/prisma-troubleshooting' as `/${string}`,
        },
      ],
    },
    {
      name: 'Drizzle',
      url: '/guides/database/drizzle',
    },
    {
      name: 'Postgres.js',
      url: '/guides/database/postgres-js',
    },
  ],
}

const guiQuickstarts: NavMenuSection = {
  name: 'GUI quickstarts',
  url: undefined,
  items: [
    {
      name: 'pgAdmin',
      url: '/guides/database/pgadmin',
    },
    {
      name: 'PSQL',
      url: '/guides/database/psql',
    },
    {
      name: 'DBeaver',
      url: '/guides/database/dbeaver',
    },
    {
      name: 'Metabase',
      url: '/guides/database/metabase',
    },
    {
      name: 'Beekeeper Studio',
      url: '/guides/database/beekeeper-studio',
    },
  ],
}

export const database: NavMenuConstant = {
  icon: 'database',
  title: 'Database',
  url: '/guides/database/overview',
  items: [
    { name: 'Overview', url: '/guides/database/overview' },
    {
      name: 'Fundamentals',
      url: undefined,
      items: [
        {
          name: 'Connecting to your database',
          url: '/guides/database/connecting-to-postgres' as `/${string}`,
        },
        { name: 'Importing data', url: '/guides/database/import-data' },
        { name: 'Securing your data', url: '/guides/database/secure-data' },
      ],
    },
  ],
}

export const cron: NavMenuConstant = {
  icon: 'cron',
  title: 'Cron',
  url: '/guides/cron',
  items: [
    { name: 'Overview', url: '/guides/cron' },
    {
      name: 'Getting Started',
      url: undefined,
      items: [
        { name: 'Install', url: '/guides/cron/install' },
        { name: 'Quickstart', url: '/guides/cron/quickstart' },
      ],
    },
  ],
}

export const queues: NavMenuConstant = {
  icon: 'queues',
  title: 'Queues',
  url: '/guides/queues',
  items: [
    { name: 'Overview', url: '/guides/queues' },
    {
      name: 'Getting Started',
      url: undefined,
      items: [
        { name: 'Quickstart', url: '/guides/queues/quickstart' },
        {
          name: 'Consuming Messages with Edge Functions',
          url: '/guides/queues/consuming-messages-with-edge-functions',
        },
      ],
    },
  ],
}

export const api: NavMenuConstant = {
  icon: 'rest',
  title: 'REST API',
  url: '/guides/api',
  items: [
    { name: 'Overview', url: '/guides/api', items: [] },
    { name: 'Quickstart', url: '/guides/api/quickstart', items: [] },
    {
      name: 'Client Libraries',
      url: '/guides/api/rest/client-libs',
      items: [],
    },
    {
      name: 'Auto-generated Docs',
      url: '/guides/api/rest/auto-generated-docs',
      items: [],
    },
    {
      name: 'Generating TypeScript Types',
      url: '/guides/api/rest/generating-types',
      items: [],
    },
    {
      name: 'Generating Python Types',
      url: '/guides/api/rest/generating-python-types',
      items: [],
    },
    {
      name: 'Tools',
      url: '/guides/api',
      items: [{ name: 'SQL to REST API Translator', url: '/guides/api/sql-to-rest' }],
    },
    {
      name: 'Guides',
      url: '/guides/api',
      items: [
        { name: 'Creating API routes', url: '/guides/api/creating-routes' },
        { name: 'How API Keys work', url: '/guides/api/api-keys' },
        { name: 'Securing your API', url: '/guides/api/securing-your-api' },
      ],
    },
    {
      name: 'Using the Data APIs',
      url: '/guides/api/data-apis',
      items: [
        {
          name: 'Managing tables, views, and data',
          url: '/guides/database/tables' as `/${string}`,
        },
        {
          name: 'Querying joins and nested tables',
          url: '/guides/database/joins-and-nesting' as `/${string}`,
        },
        {
          name: 'JSON and unstructured data',
          url: '/guides/database/json' as `/${string}`,
        },
        {
          name: 'Managing database functions',
          url: '/guides/database/functions' as `/${string}`,
        },
        {
          name: 'Using full-text search',
          url: '/guides/database/full-text-search' as `/${string}`,
        },
        {
          name: 'Debugging performance issues',
          url: '/guides/database/debugging-performance' as `/${string}`,
        },
        {
          name: 'Using custom schemas',
          url: '/guides/api/using-custom-schemas' as `/${string}`,
        },
        {
          name: 'Converting from SQL to JavaScript API',
          url: '/guides/api/sql-to-api' as `/${string}`,
        },
      ],
    },
  ],
}

export const graphql: NavMenuConstant = {
  icon: 'graphql',
  title: 'GraphQL',
  url: '/guides/graphql',
  items: [
    { name: 'Overview', url: '/guides/graphql', items: [] },
    { name: 'API', url: '/guides/graphql/api', items: [] },
  ],
}

export const functions: NavMenuConstant = {
  icon: 'edge-functions',
  title: 'Edge Functions',
  url: '/guides/functions',
  items: [
    {
      name: 'Overview',
      url: '/guides/functions',
    },
    {
      name: 'Getting started',
      url: undefined,
      items: [
        {
          name: 'Quickstart (Dashboard)',
          url: '/guides/functions/quickstart-dashboard' as `/${string}`,
        },
        {
          name: 'Quickstart (CLI)',
          url: '/guides/functions/quickstart' as `/${string}`,
        },
        {
          name: 'Development Environment',
          url: '/guides/functions/development-environment' as `/${string}`,
        },
        {
          name: 'Architecture',
          url: '/guides/functions/architecture',
        },
      ],
    },
    {
      name: 'Configuration',
      url: undefined,
      items: [
        { name: 'Environment Variables', url: '/guides/functions/secrets' },
        { name: 'Managing Dependencies', url: '/guides/functions/dependencies' },
        { name: 'Function Configuration', url: '/guides/functions/function-configuration' },
      ],
    },
    {
      name: 'Development',
      url: undefined,
      items: [
        { name: 'Error Handling', url: '/guides/functions/error-handling' },
        { name: 'Routing', url: '/guides/functions/routing' },
        {
          name: 'Deploy to Production',
          url: '/guides/functions/deploy' as `/${string}`,
        },
      ],
    },
    {
      name: 'Debugging',
      url: undefined,
      items: [
        {
          name: 'Local Debugging with DevTools',
          url: '/guides/functions/debugging-tools' as `/${string}`,
        },
        {
          name: 'Testing your Functions',
          url: '/guides/functions/unit-test' as `/${string}`,
        },
        {
          name: 'Logging',
          url: '/guides/functions/logging' as `/${string}`,
        },
        {
          name: 'Troubleshooting',
          url: '/guides/functions/troubleshooting' as `/${string}`,
        },
      ],
    },
    {
      name: 'Platform',
      url: undefined,
      items: [
        {
          name: 'Regional invocations',
          url: '/guides/functions/regional-invocation' as `/${string}`,
        },
        {
          name: 'Status codes',
          url: '/guides/functions/status-codes' as `/${string}`,
        },
        {
          name: 'Limits',
          url: '/guides/functions/limits' as `/${string}`,
          enabled: billingEnabled,
        },
        {
          name: 'Pricing',
          url: '/guides/functions/pricing' as `/${string}`,
          enabled: billingEnabled,
        },
      ],
    },
    {
      name: 'Integrations',
      url: undefined,
      items: [
        {
          name: 'BA Auth',
          url: '/guides/functions/auth',
          items: [
            { name: 'Securing your functions', url: '/guides/functions/auth' },
            { name: 'Legacy JWT secret', url: '/guides/functions/auth-legacy-jwt' },
          ],
        },
        { name: 'BA Database (Postgres)', url: '/guides/functions/connect-to-postgres' },
        { name: 'BA Storage', url: '/guides/functions/storage-caching' },
      ],
    },
    {
      name: 'Advanced Features',
      url: undefined,
      items: [
        { name: 'Background Tasks', url: '/guides/functions/background-tasks' },
        { name: 'File Storage', url: '/guides/functions/ephemeral-storage' },
        { name: 'WebSockets', url: '/guides/functions/websockets' },
        { name: 'Custom Routing', url: '/guides/functions/routing' },
        { name: 'Wasm Modules', url: '/guides/functions/wasm' },
        { name: 'AI Models', url: '/guides/functions/ai-models' },
      ],
    },
    {
      name: 'Examples',
      url: undefined,
      items: [
        {
          name: 'Auth Send Email Hook',
          url: '/guides/functions/examples/auth-send-email-hook-react-email-resend' as `/${string}`,
        },
        {
          name: 'Building an MCP Server with mcp-lite',
          url: '/guides/functions/examples/mcp-server-mcp-lite' as `/${string}`,
        },
        {
          name: 'CORS support for invoking from the browser',
          url: '/guides/functions/cors' as `/${string}`,
        },
        {
          name: 'Scheduling Functions',
          url: '/guides/functions/schedule-functions' as `/${string}`,
        },
        {
          name: 'Sending Push Notifications',
          url: '/guides/functions/examples/push-notifications' as `/${string}`,
        },
        {
          name: 'Generating AI images',
          url: '/guides/functions/examples/amazon-bedrock-image-generator' as `/${string}`,
        },
        {
          name: 'Generating OG images ',
          url: '/guides/functions/examples/og-image' as `/${string}`,
        },
        {
          name: 'Semantic AI Search',
          url: '/guides/functions/examples/semantic-search' as `/${string}`,
        },
        {
          name: 'CAPTCHA support with Cloudflare Turnstile',
          url: '/guides/functions/examples/cloudflare-turnstile' as `/${string}`,
        },
        {
          name: 'Building a Discord Bot',
          url: '/guides/functions/examples/discord-bot' as `/${string}`,
        },
        {
          name: 'Building a Telegram Bot',
          url: '/guides/functions/examples/telegram-bot' as `/${string}`,
        },
        {
          name: 'Handling Stripe Webhooks ',
          url: '/guides/functions/examples/stripe-webhooks' as `/${string}`,
        },
        {
          name: 'Rate-limiting with Redis',
          url: '/guides/functions/examples/rate-limiting' as `/${string}`,
        },
        {
          name: 'Taking Screenshots with Puppeteer',
          url: '/guides/functions/examples/screenshots' as `/${string}`,
        },
        {
          name: 'Slack Bot responding to mentions',
          url: '/guides/functions/examples/slack-bot-mention' as `/${string}`,
        },
        {
          name: 'Image Transformation & Optimization',
          url: '/guides/functions/examples/image-manipulation' as `/${string}`,
        },
      ],
    },
    {
      name: 'Third-Party Tools',
      url: undefined,
      items: [
        { name: 'Dart Edge on BA', url: '/guides/functions/dart-edge' },
        {
          name: 'mcp-lite (Model Context Protocol)',
          url: '/guides/functions/examples/mcp-server-mcp-lite' as `/${string}`,
        },
        {
          name: 'Browserless.io',
          url: '/guides/functions/examples/screenshots' as `/${string}`,
        },
        {
          name: 'Hugging Face',
          url: '/guides/ai/examples/huggingface-image-captioning' as `/${string}`,
        },
        {
          name: 'Monitoring with Sentry',
          url: '/guides/functions/examples/sentry-monitoring' as `/${string}`,
        },
        { name: 'OpenAI API', url: '/guides/ai/examples/openai' },
        {
          name: 'React Email',
          url: '/guides/functions/examples/auth-send-email-hook-react-email-resend' as `/${string}`,
        },
        {
          name: 'Sending Emails with Resend',
          url: '/guides/functions/examples/send-emails' as `/${string}`,
        },
        {
          name: 'Upstash Redis',
          url: '/guides/functions/examples/upstash-redis' as `/${string}`,
        },
        {
          name: 'Type-Safe SQL with Kysely',
          url: '/guides/functions/kysely-postgres' as `/${string}`,
        },
        {
          name: 'Text To Speech with ElevenLabs',
          url: '/guides/functions/examples/elevenlabs-generate-speech-stream' as `/${string}`,
        },
        {
          name: 'Speech Transcription with ElevenLabs',
          url: '/guides/functions/examples/elevenlabs-transcribe-speech' as `/${string}`,
        },
      ],
    },
  ],
}

export const realtime: NavMenuConstant = {
  icon: 'realtime',
  title: 'Realtime',
  url: '/guides/realtime',
  items: [
    {
      name: 'Overview',
      url: '/guides/realtime',
    },
    {
      name: 'Getting Started',
      url: '/guides/realtime/getting_started',
    },
  ],
}

export const storage: NavMenuConstant = {
  icon: 'storage',
  title: 'Storage',
  url: '/guides/storage',
  items: [
    { name: 'Overview', url: '/guides/storage' },
    {
      name: 'File Buckets',
      url: undefined,
      items: [
        { name: 'Quickstart', url: '/guides/storage/quickstart' },
        { name: 'Fundamentals', url: '/guides/storage/buckets/fundamentals' },
        {
          name: 'Creating Buckets',
          url: '/guides/storage/buckets/creating-buckets' as `/${string}`,
        },
        {
          name: 'Security',
          url: '/guides/storage/security',
          items: [
            {
              name: 'Ownership',
              url: '/guides/storage/security/ownership' as `/${string}`,
            },
            {
              name: 'Access Control',
              url: '/guides/storage/security/access-control' as `/${string}`,
            },
          ],
        },
        {
          name: 'Uploads',
          url: '/guides/storage/uploads',
          items: [
            {
              name: 'Standard Uploads',
              url: '/guides/storage/uploads/standard-uploads' as `/${string}`,
            },
            {
              name: 'Resumable Uploads',
              url: '/guides/storage/uploads/resumable-uploads' as `/${string}`,
            },
            {
              name: 'S3 Uploads',
              url: '/guides/storage/uploads/s3-uploads' as `/${string}`,
            },
            { name: 'Limits', url: '/guides/storage/uploads/file-limits', enabled: billingEnabled },
          ],
        },
        {
          name: 'Serving',
          url: '/guides/storage/serving',
          items: [
            { name: 'Serving assets', url: '/guides/storage/serving/downloads' },
            {
              name: 'Image Transformations',
              url: '/guides/storage/serving/image-transformations' as `/${string}`,
            },
            {
              name: 'Bandwidth & Storage Egress',
              url: '/guides/storage/serving/bandwidth' as `/${string}`,
              enabled: billingEnabled,
            },
          ],
        },
        {
          name: 'Management',
          url: '/guides/storage/management',
          items: [
            { name: 'Copy / Move Objects', url: '/guides/storage/management/copy-move-objects' },
            { name: 'Delete Objects', url: '/guides/storage/management/delete-objects' },
          ],
        },
        {
          name: 'S3',
          url: '/guides/storage/s3',
          items: [
            { name: 'Authentication', url: '/guides/storage/s3/authentication' },
            { name: 'API Compatibility', url: '/guides/storage/s3/compatibility' },
          ],
        },
        {
          name: 'CDN',
          url: '/guides/storage/cdn',
          items: [
            { name: 'Fundamentals', url: '/guides/storage/cdn/fundamentals' },
            { name: 'Smart CDN', url: '/guides/storage/cdn/smart-cdn' },
            { name: 'Metrics', url: '/guides/storage/cdn/metrics' },
          ],
        },
        {
          name: 'Debugging',
          url: '/guides/storage/debugging',
          items: [
            { name: 'Logs', url: '/guides/storage/debugging/logs' },
            { name: 'Error Codes', url: '/guides/storage/debugging/error-codes' },
            { name: 'Troubleshooting', url: '/guides/storage/troubleshooting' },
          ],
        },
        {
          name: 'Schema',
          url: '/guides/storage/schema',
          items: [
            { name: 'Database Design', url: '/guides/storage/schema/design' },
            {
              name: 'Helper Functions',
              url: '/guides/storage/schema/helper-functions' as `/${string}`,
            },
            { name: 'Custom Roles', url: '/guides/storage/schema/custom-roles' },
          ],
        },
        {
          name: 'Going to production',
          url: '/guides/storage/production',
          items: [{ name: 'Scaling', url: '/guides/storage/production/scaling' }],
        },
        {
          name: 'Pricing',
          url: '/guides/storage/pricing' as `/${string}`,
          enabled: billingEnabled,
        },
      ],
    },
  ],
}

export const vectorIndexItems: Array<Partial<NavMenuSection>> = [
  {
    name: 'HNSW indexes',
    url: '/guides/ai/vector-indexes/hnsw-indexes',
  },
  {
    name: 'IVFFlat indexes',
    url: '/guides/ai/vector-indexes/ivf-indexes',
  },
]

export const ai: NavMenuConstant = {
  icon: 'ai',
  title: 'AI & Vectors',
  url: '/guides/ai',
  items: [
    { name: 'Overview', url: '/guides/ai' },
    { name: 'Concepts', url: '/guides/ai/concepts' },
  ],
}

export const local_development: NavMenuConstant = {
  icon: 'dev-cli',
  title: 'Local Dev / CLI',
  url: '/guides/local-development',
  items: [
    { name: 'Overview', url: '/guides/local-development' },
    {
      name: 'CLI',
      url: undefined,
      items: [
        { name: 'Getting started', url: '/guides/local-development/cli/getting-started' },
        {
          name: 'Configuration',
          url: '/guides/local-development/cli/config',
          enabled: localDevelopmentEnabled,
        },
        { name: 'CLI commands', url: '/reference/cli' },
      ],
    },
  ],
}

export const contributing: NavMenuConstant = {
  icon: 'contributing',
  title: 'Contributing',
  url: '/contributing',
  enabled: contributionEnabled,
  items: [{ name: 'Overview', url: '/contributing' }],
}

export const MIGRATION_PAGES: Partial<NavMenuSection & ComponentProps<typeof IconPanel>>[] = [
  {
    name: 'Auth0',
    icon: '/docs/img/icons/auth0-icon',
    url: '/guides/platform/migrating-to-supabase/auth0',
    hasLightIcon: true,
  },
  {
    name: 'Firebase Auth',
    icon: '/docs/img/icons/firebase-icon',
    url: '/guides/platform/migrating-to-supabase/firebase-auth',
  },
  {
    name: 'Firestore Data',
    icon: '/docs/img/icons/firebase-icon',
    url: '/guides/platform/migrating-to-supabase/firestore-data',
  },
  {
    name: 'Firebase Storage',
    icon: '/docs/img/icons/firebase-icon',
    url: '/guides/platform/migrating-to-supabase/firebase-storage',
  },
  {
    name: 'Heroku',
    icon: '/docs/img/icons/heroku-icon',
    url: '/guides/platform/migrating-to-supabase/heroku',
  },
  {
    name: 'Render',
    icon: '/docs/img/icons/render-icon',
    url: '/guides/platform/migrating-to-supabase/render',
  },
  {
    name: 'Amazon RDS',
    icon: '/docs/img/icons/aws-rds-icon',
    url: '/guides/platform/migrating-to-supabase/amazon-rds',
  },
  {
    name: 'Postgres',
    icon: '/docs/img/icons/postgres-icon',
    url: '/guides/platform/migrating-to-supabase/postgres',
  },
  {
    name: 'Vercel Postgres',
    icon: '/docs/img/icons/vercel-icon',
    url: '/guides/platform/migrating-to-supabase/vercel-postgres',
    hasLightIcon: true,
  },
  {
    name: 'Neon',
    icon: '/docs/img/icons/neon-icon',
    url: '/guides/platform/migrating-to-supabase/neon',
    hasLightIcon: true,
  },
  {
    name: 'MySQL',
    icon: '/docs/img/icons/mysql-icon',
    url: '/guides/platform/migrating-to-supabase/mysql',
  },
  {
    name: 'MSSQL',
    icon: '/docs/img/icons/mssql-icon',
    url: '/guides/platform/migrating-to-supabase/mssql',
  },
]

export const security: NavMenuConstant = {
  icon: 'security',
  title: 'Security',
  url: '/guides/security',
  items: [
    { name: 'Overview', url: '/guides/security' },
    {
      name: 'Product security',
      url: undefined,
      items: [
        { name: 'Platform configuration', url: '/guides/security/platform-security' },
        { name: 'Product configuration', url: '/guides/security/product-security' },
        { name: 'Security testing', url: '/guides/security/security-testing' },
        { name: 'Platform Audit Logs', url: '/guides/security/platform-audit-logs' },
      ],
    },
  ],
}

export const platform: NavMenuConstant = {
  icon: 'platform',
  title: 'Platform',
  url: '/guides/platform',
  items: [
    {
      name: 'Add-ons',
      url: undefined,
      items: [
        { name: 'Custom Domains', url: '/guides/platform/custom-domains' },
        { name: 'Database Backups', url: '/guides/platform/backups' },
        { name: 'IPv4 Address', url: '/guides/platform/ipv4-address' },
        { name: 'Read Replicas', url: '/guides/platform/read-replicas' },
      ],
    },
    {
      name: 'Upgrades & Migrations',
      url: undefined,
      enabled: fullPlatformEnabled,
      items: [
        { name: 'Upgrading', url: '/guides/platform/upgrading' },
        {
          name: 'Migrating within BA',
          url: '/guides/platform/migrating-within-supabase',
          items: [
            {
              name: 'Overview',
              url: '/guides/platform/migrating-within-supabase' as `/${string}`,
            },
            {
              name: 'Restore Dashboard backup',
              url: '/guides/platform/migrating-within-supabase/dashboard-restore' as `/${string}`,
            },
            {
              name: 'Backup and restore using CLI',
              url: '/guides/platform/migrating-within-supabase/backup-restore' as `/${string}`,
            },
          ],
        },
        {
          name: 'Migrating to BA',
          url: '/guides/platform/migrating-to-supabase',
          items: [
            { name: 'Overview', url: '/guides/platform/migrating-to-supabase' as `/${string}` },
            ...MIGRATION_PAGES,
          ],
        },
      ],
    },
  ],
}

export const telemetry: NavMenuConstant = {
  icon: 'telemetry',
  title: 'Telemetry',
  url: '/guides/telemetry',
  items: [
    { name: 'Overview', url: '/guides/telemetry' },
    {
      name: 'Logging & observability',
      url: undefined,
      items: [
        {
          name: 'Logging',
          url: '/guides/telemetry/logs' as `/${string}`,
        },
        {
          name: 'Advanced log filtering',
          url: '/guides/telemetry/advanced-log-filtering' as `/${string}`,
        },
        {
          name: 'Log drains',
          url: '/guides/telemetry/log-drains' as `/${string}`,
        },
        {
          name: 'Reports',
          url: '/guides/telemetry/reports' as `/${string}`,
        },
        {
          name: 'Metrics',
          url: '/guides/telemetry/metrics' as `/${string}`,
          items: [
            {
              name: 'Overview',
              url: '/guides/telemetry/metrics' as `/${string}`,
            },
            {
              name: 'Grafana Cloud',
              url: '/guides/telemetry/metrics/grafana-cloud' as `/${string}`,
            },
            {
              name: 'Grafana self-hosted',
              url: '/guides/telemetry/metrics/grafana-self-hosted' as `/${string}`,
            },
            {
              name: 'Datadog',
              url: 'https://docs.datadoghq.com/integrations/supabase/' as `/${string}`,
            },
            {
              name: 'Vendor-agnostic setup',
              url: '/guides/telemetry/metrics/vendor-agnostic' as `/${string}`,
            },
          ],
        },
        {
          name: 'Sentry integration',
          url: '/guides/telemetry/sentry-monitoring' as `/${string}`,
        },
      ],
    },
  ],
}

export const resources: NavMenuConstant = {
  icon: 'resources',
  title: 'Resources',
  url: '/guides/resources',
  items: [{ name: 'Glossary', url: '/guides/resources/glossary' }],
}

export const self_hosting: NavMenuConstant = {
  title: 'Self-Hosting',
  icon: 'self-hosting',
  url: '/guides/self-hosting',
  items: [
    { name: 'Overview', url: '/guides/self-hosting' },
    { name: 'Self-Hosting with Docker', url: '/guides/self-hosting/docker' },
  ],
}

export const deployment: NavMenuConstant = {
  title: 'Deployment & Branching',
  url: '/guides/deployment',
  icon: 'git-branch',
  items: [
    { name: 'Overview', url: '/guides/deployment' },
    {
      name: 'Environments',
      items: [
        { name: 'Managing environments', url: '/guides/deployment/managing-environments' },
        { name: 'Database migrations', url: '/guides/deployment/database-migrations' },
      ],
    },
  ],
}

export const integrations: NavMenuConstant = {
  title: 'Integrations',
  icon: 'integrations',
  url: '/guides/integrations',
  enabled: integrationsEnabled,
  items: [
    {
      name: 'Overview',
      url: '/guides/integrations',
    },
    {
      name: 'Vercel Marketplace',
      url: '/guides/integrations/vercel-marketplace',
    },
  ],
}

export const reference = {
  title: 'API Reference',
  icon: 'reference',
  items: [
    {
      name: 'Client libraries',
      items: [
        {
          name: 'supabase-js',
          url: '/reference/javascript/start',
          level: 'reference_javascript',
          icon: '/img/icons/menu/reference-javascript' as `/${string}`,
        },
        {
          name: 'supabase-dart',
          url: '/reference/dart/start',
          level: 'reference_dart',
          icon: '/img/icons/menu/reference-dart' as `/${string}`,
          enabled: sdkDartEnabled,
        },
        {
          name: 'supabase-csharp',
          url: '/reference/csharp/start',
          level: 'reference_csharp',
          icon: '/img/icons/menu/reference-csharp' as `/${string}`,
          enabled: sdkCsharpEnabled,
        },
        {
          name: 'supbase-python',
          url: '/reference/python/start',
          level: 'reference_python',
          icon: '/img/icons/menu/reference-python' as `/${string}`,
          enabled: sdkPythonEnabled,
        },
        {
          name: 'supbase-swift',
          url: '/reference/swift/start',
          level: 'reference_swift',
          items: [],
          icon: '/img/icons/menu/reference-swift' as `/${string}`,
          enabled: sdkSwiftEnabled,
        },
        {
          name: 'supabase-kt',
          url: '/reference/kotlin/start',
          level: 'reference_kotlin',
          items: [],
          icon: '/img/icons/menu/reference-kotlin' as `/${string}`,
          enabled: sdkKotlinEnabled,
        },
      ],
    },
    {
      name: 'Other tools',
      items: [
        {
          name: 'BA CLI',
          url: '/reference/cli/start',
          icon: '/img/icons/menu/reference-cli' as `/${string}`,
        },
        {
          name: 'Management API',
          url: '/reference/javascript',
          icon: '/img/icons/menu/reference-api' as `/${string}`,
        },
      ],
    },
  ],
}

export const reference_javascript_v1 = {
  icon: 'reference-javascript',
  title: 'JavaScript',
  url: '/reference/javascript/v1',
  parent: '/reference',
  pkg: {
    name: '@supabase/supabase-js',
    repo: 'https://github.com/vchavkov82/nextjs-js',
  },
}

export const reference_javascript_v2 = {
  icon: 'reference-javascript',
  title: 'JavaScript',
  url: '/reference/javascript',
  parent: '/reference',
  pkg: {
    name: '@supabase/supabase-js',
    repo: 'https://github.com/vchavkov82/nextjs-js',
  },
}

// TODO: How to?
export const reference_dart_v1 = {
  icon: 'reference-dart',
  title: 'Flutter',
  url: '/reference/dart/v1',
  parent: '/reference',
  pkg: {
    name: 'supabase_flutter',
    repo: 'https://github.com/vchavkov82/nextjs-flutter',
  },
}

export const reference_dart_v2 = {
  icon: 'reference-dart',
  title: 'Flutter',
  url: '/reference/dart',
  parent: '/reference',
  pkg: {
    name: 'supabase_flutter',
    repo: 'https://github.com/vchavkov82/nextjs-flutter',
  },
}

export const reference_csharp_v0 = {
  icon: 'reference-csharp',
  title: 'C#',
  url: '/reference/csharp/v0',
  parent: '/reference',
  pkg: {
    name: 'supabase',
    repo: 'https://github.com/supabase-community/supabase-csharp',
  },
}

export const reference_csharp_v1 = {
  icon: 'reference-csharp',
  title: 'C#',
  url: '/reference/csharp',
  parent: '/reference',
  pkg: {
    name: 'supabase',
    repo: 'https://github.com/supabase-community/supabase-csharp',
  },
}

export const reference_python_v2 = {
  icon: 'reference-python',
  title: 'Python',
  url: '/reference/python',
  parent: '/reference',
  pkg: {
    name: 'supabase-py',
    repo: 'https://github.com/vchavkov82/nextjs-py',
  },
}

export const reference_swift_v1 = {
  icon: 'reference-swift',
  title: 'swift',
  url: '/reference/swift',
  parent: '/reference',
  pkg: {
    name: 'supabase-swift',
    repo: 'https://github.com/vchavkov82/nextjs-swift',
  },
}

export const reference_swift_v2 = {
  icon: 'reference-swift',
  title: 'swift',
  url: '/reference/swift',
  parent: '/reference',
  pkg: {
    name: 'supabase-swift',
    repo: 'https://github.com/vchavkov82/nextjs-swift',
  },
}

export const reference_kotlin_v1 = {
  icon: 'reference-kotlin',
  title: 'kotlin',
  url: '/reference/kotlin',
  parent: '/reference',
  pkg: {
    name: '@supabase-community/supabase-kt',
    repo: 'https://github.com/supabase-community/supabase-kt',
  },
}

export const reference_kotlin_v2 = {
  icon: 'reference-kotlin',
  title: 'kotlin',
  url: '/reference/kotlin',
  parent: '/reference',
  pkg: {
    name: '@supabase-community/supabase-kt',
    repo: 'https://github.com/supabase-community/supabase-kt',
  },
}

export const reference_kotlin_v3 = {
  icon: 'reference-kotlin',
  title: 'kotlin',
  url: '/reference/kotlin',
  parent: '/reference',
  pkg: {
    name: '@supabase-community/supabase-kt',
    repo: 'https://github.com/supabase-community/supabase-kt',
  },
}

export const reference_cli = {
  icon: 'reference-cli',
  title: 'BA CLI',
  url: '/reference/cli/introduction',
  parent: '/',
  pkg: {
    name: 'supabase',
    repo: 'https://github.com/supabase/cli',
  },
}
export const reference_api = {
  icon: 'reference-api',
  title: 'Management API',
  url: '/reference/api/introduction',
  parent: '/reference',
}

export const reference_self_hosting_auth = {
  icon: 'self-hosting',
  title: 'Self-Hosting Auth',
  url: '/reference/self-hosting-auth',
  parent: '/reference',
}

export const reference_self_hosting_storage = {
  icon: 'self-hosting',
  title: 'Self-Hosting Storage',
  url: '/reference/self-hosting-storage',
  parent: '/reference',
}

export const reference_self_hosting_realtime = {
  icon: 'self-hosting',
  title: 'Self-Hosting Realtime',
  url: '/reference/self-hosting-realtime',
  parent: '/reference',
}

export const reference_self_hosting_analytics = {
  icon: 'reference-analytics',
  title: 'Self-Hosting Analytics',
  url: '/reference/self-hosting-analytics',
  parent: '/reference',
}

export const reference_self_hosting_functions = {
  icon: 'reference-functions',
  title: 'Self-Hosting Functions',
  url: '/reference/self-hosting-functions',
  parent: '/reference',
}

export const references = [
  {
    label: 'Client libraries',
    items: [
      {
        label: 'supabase-js',
        versions: ['v2', 'v1'],
        description: 'something about the reference',
        icon: '/docs/img/icons/javascript-icon.svg',
        url: '/reference/javascript/start',
      },
      {
        label: 'supabase-py',
        description: 'something about the reference',
        icon: '/docs/img/icons/python-icon.svg',
        url: '/reference/python/start',
        enabled: sdkPythonEnabled,
      },
      {
        label: 'supabase-dart',
        versions: ['v1', 'v0'],
        description: 'something about the reference',
        icon: '/docs/img/icons/dart-icon.svg',
        url: '/reference/dart/start',
        enabled: sdkDartEnabled,
      },
      {
        label: 'supabase-csharp',
        versions: ['v0'],
        description: 'something about the reference',
        icon: '/docs/img/icons/c-sharp-icon.svg',
        url: '/reference/csharp/start',
        enabled: sdkCsharpEnabled,
      },
      {
        label: 'supabase-swift',
        versions: ['v2', 'v1'],
        description: 'something about the reference',
        icon: '/docs/img/icons/swift-icon.svg',
        url: '/reference/swift/start',
        enabled: sdkSwiftEnabled,
      },
      {
        label: 'supabase-kt',
        versions: ['v3', 'v2', 'v1'],
        description: 'something about the reference',
        icon: '/docs/img/icons/kotlin-icon.svg',
        url: '/reference/kotlin/start',
        enabled: sdkKotlinEnabled,
      },
    ],
  },
  {
    label: 'Platform Tools',
    items: [
      {
        label: 'CLI',
        description: 'something about the reference',
        icon: '/docs/img/icons/cli-icon.svg',
        url: '/reference/cli/start',
      },
      {
        label: 'Management API',
        description: 'something about the reference',
        icon: '/docs/img/icons/api-icon.svg',
        url: '/reference/management-api/start',
      },
    ],
  },
  {
    label: 'Self-Hosting',
    items: [
      {
        label: 'Auth server',
        description: 'something about the reference',
        icon: '/docs/img/icons/menu/auth.svg',
        url: '/reference/auth/start',
      },
      {
        label: 'Storage server',
        description: 'something about the reference',
        icon: '/docs/img/icons/menu/storage.svg',
        url: '/reference/storage/start',
      },
      {
        label: 'Realtime server',
        description: 'something about the reference',
        icon: '/docs/img/icons/menu/realtime.svg',
        url: '/reference/realtime/start',
      },
    ],
  },
]

export const navDataForMdx = {
  migrationPages: MIGRATION_PAGES,
  nativeMobileLoginItems: NativeMobileLoginItems,
  socialLoginItems: SocialLoginItems,
  ormQuickstarts,
  guiQuickstarts,
}
