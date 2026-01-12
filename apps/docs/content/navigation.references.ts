import { isFeatureEnabled } from 'common/enabled-features'

// Cache the feature flags as plain values to avoid module dependencies in serialization
const _features = isFeatureEnabled(['sdk:csharp', 'sdk:dart', 'sdk:kotlin', 'sdk:python', 'sdk:swift'])
const sdkCsharpEnabled = !!_features.sdkCsharp
const sdkDartEnabled = !!_features.sdkDart
const sdkKotlinEnabled = !!_features.sdkKotlin
const sdkPythonEnabled = !!_features.sdkPython
const sdkSwiftEnabled = !!_features.sdkSwift

export const REFERENCES = {
  ci_cd_runners: {
    type: 'sdk',
    name: 'CI/CD Runners',
    library: 'ci-cd-runners',
    libPath: 'ci-cd-runners',
    versions: ['v1'],
    icon: 'github',
    meta: {
      v1: {
        libId: 'reference_ci_cd_runners_v1',
        specFile: 'ci_cd_runners_v1',
      },
    },
  },
  dart: {
    type: 'sdk',
    name: 'Flutter',
    library: 'supabase-dart',
    libPath: 'dart',
    versions: ['v2', 'v1'],
    icon: 'reference-dart',
    meta: {
      v2: {
        libId: 'reference_dart_v2',
        specFile: 'supabase_dart_v2',
      },
      v1: {
        libId: 'reference_dart_v1',
        specFile: 'supabase_dart_v1',
      },
    },
    enabled: sdkDartEnabled,
  },
  csharp: {
    type: 'sdk',
    name: 'C#',
    library: 'supabase-csharp',
    libPath: 'csharp',
    versions: ['v1', 'v0'],
    icon: 'reference-csharp',
    meta: {
      v1: {
        libId: 'reference_csharp_v1',
        specFile: 'supabase_csharp_v1',
      },
      v0: {
        libId: 'reference_csharp_v0',
        specFile: 'supabase_csharp_v0',
      },
    },
    enabled: sdkCsharpEnabled,
  },
  swift: {
    type: 'sdk',
    name: 'Swift',
    library: 'supabase-swift',
    libPath: 'swift',
    versions: ['v2', 'v1'],
    icon: 'reference-swift',
    meta: {
      v2: {
        libId: 'reference_swift_v2',
        specFile: 'supabase_swift_v2',
      },
      v1: {
        libId: 'reference_swift_v1',
        specFile: 'supabase_swift_v1',
      },
    },
    enabled: sdkSwiftEnabled,
  },
  kotlin: {
    type: 'sdk',
    name: 'Kotlin',
    library: 'supabase-kt',
    libPath: 'kotlin',
    versions: ['v3', 'v2', 'v1'],
    icon: 'reference-kotlin',
    meta: {
      v3: {
        libId: 'reference_kotlin_v3',
        specFile: 'supabase_kt_v3',
      },
      v2: {
        libId: 'reference_kotlin_v2',
        specFile: 'supabase_kt_v2',
      },
      v1: {
        libId: 'reference_kotlin_v1',
        specFile: 'supabase_kt_v1',
      },
    },
    enabled: sdkKotlinEnabled,
  },
  python: {
    type: 'sdk',
    name: 'Python',
    library: 'supabase-py',
    libPath: 'python',
    versions: ['v2'],
    icon: 'reference-python',
    meta: {
      v2: {
        libId: 'reference_python_v2',
        specFile: 'supabase_py_v2',
      },
    },
    enabled: sdkPythonEnabled,
  },
  cli: {
    type: 'cli',
    name: 'CLI',
    libPath: 'cli',
    versions: [],
    icon: 'reference-cli',
  },
  api: {
    type: 'api',
    name: 'API',
    libPath: 'api',
    versions: [],
    icon: 'reference-api',
  },
  self_hosting_analytics: {
    type: 'self-hosting',
    name: 'Self-Hosting Analytics',
    libPath: 'self-hosting-analytics',
    versions: [],
    icon: 'reference-analytics',
  },
  self_hosting_auth: {
    type: 'self-hosting',
    name: 'Self-Hosting Auth',
    libPath: 'self-hosting-auth',
    versions: [],
    icon: 'self-hosting',
  },
  self_hosting_functions: {
    type: 'self-hosting',
    name: 'Self-Hosting Functions',
    libPath: 'self-hosting-functions',
    versions: [],
    icon: 'reference-functions',
  },
  self_hosting_realtime: {
    type: 'self-hosting',
    name: 'Self-Hosting Realtime',
    libPath: 'self-hosting-realtime',
    versions: [],
    icon: 'self-hosting',
  },
  self_hosting_storage: {
    type: 'self-hosting',
    name: 'Self-Hosting Storage',
    libPath: 'self-hosting-storage',
    versions: [],
    icon: 'self-hosting',
  },
}

// Export plain arrays (not computed, to avoid any module references)
export const clientSdkIds = Object.keys(REFERENCES).filter(
  (reference) => (REFERENCES[reference as keyof typeof REFERENCES] as any).type === 'sdk' && (REFERENCES[reference as keyof typeof REFERENCES] as any).enabled !== false
)

export const selfHostingServices = Object.keys(REFERENCES).filter(
  (reference) => (REFERENCES[reference as keyof typeof REFERENCES] as any).type === 'self-hosting'
)

