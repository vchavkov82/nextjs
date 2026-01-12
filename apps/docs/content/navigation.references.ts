export const REFERENCES = {
  ci_cd_runners: {
    type: 'sdk',
    name: 'CI/CD Runners',
    library: 'ci-cd-runners',
    libPath: 'ci-cd-runners',
    versions: ['v1', 'v0'],
    icon: 'github',
    meta: {
      v1: {
        libId: 'reference_ci_cd_runners_v1',
      },
      v0: {
        libId: 'reference_ci_cd_runners_v0',
      },
    },
  },
  api: {
    type: 'api',
    name: 'API',
    libPath: 'api',
    versions: [],
    icon: 'reference-api',
  },
}

// Export plain arrays (not computed, to avoid any module references)
export const clientSdkIds = Object.keys(REFERENCES).filter(
  (reference) => (REFERENCES[reference as keyof typeof REFERENCES] as any).type === 'sdk' && (REFERENCES[reference as keyof typeof REFERENCES] as any).enabled !== false
)

export const selfHostingServices: string[] = []

