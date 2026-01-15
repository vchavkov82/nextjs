export const REFERENCES = {
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

