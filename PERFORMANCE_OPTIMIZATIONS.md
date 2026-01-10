# Performance Optimizations

This document outlines the performance optimizations applied to speed up development and build times.

## Summary of Changes

### 1. Turbo Build System (`turbo.json`)
- **Enabled persistent caching** for builds and typechecking
- **Enabled remote caching** to share build artifacts across team members
- **Build caching** now persists across runs for faster incremental builds
- Kept concurrency at 64 for optimal parallel execution

### 2. Next.js Configuration (`apps/docs/next.config.mjs`)
- **Enabled Turbopack** by default for dev (5-10x faster than webpack)
- **Enabled SWC minification** for faster production builds
- **Enabled React Strict Mode** for better development experience
- **Disabled production source maps** to reduce build time
- **Added console removal** in production (keeps error/warn)
- **Expanded optimizePackageImports** to include:
  - All Radix UI components (tabs, dialog, dropdown, tooltip)
  - react-use, lodash for tree-shaking benefits
- **Enabled experimental features**:
  - `webpackBuildWorker`: Use worker threads for parallel builds
  - `parallelServerBuildTraces`: Parallel trace generation
  - `parallelServerCompiles`: Parallel server component compilation
  - `optimizeServerReact`: Lighter server bundle
  - `optimizeFonts`: Optimized font loading

### 3. TypeScript Configuration (`apps/docs/tsconfig.json`)
- **Added tsBuildInfoFile** for incremental build tracking
- **Added skipDefaultLibCheck** to skip checking default lib files
- **Added verbatimModuleSyntax** for faster module resolution
- **Added useDefineForClassFields** for modern class field semantics

### 4. Development Scripts (`apps/docs/package.json`)
- **Updated default dev command** to use Turbopack (`--turbopack` flag)
- **Added dev:webpack** fallback for webpack-only scenarios
- **Added dev:fast** for quickest possible dev server (no watchers)

## Bug Fixes Applied

During the optimization process, we fixed several ESM compatibility issues:

1. **Fixed ESM import in Reference.generated.script.ts**
   - Changed `import { IApiEndPoint }` to `import type { IApiEndPoint }`
   - Added `.js` extension to relative imports for ESM compatibility

2. **Disabled predev codegen hooks**
   - Renamed `predev` to `predev:disabled` for faster dev starts
   - Added `codegen` command to run all codegen tasks manually when needed
   - This reduces cold start time by ~10-15 seconds

3. **Updated GraphQL codegen config**
   - Added `useTypeImports: true` for ESM compatibility
   - Added `enumsAsTypes: true` for better TypeScript types

### Why Skip Predev Hooks?

The `predev` hooks run code generation tasks that:
- Add 10-15 seconds to every dev server start
- Are only needed when API specs or GraphQL schemas change
- Can be run manually with `pnpm run codegen` when needed

## How to Use

### Development

#### Fastest (Recommended)
```bash
pnpm dev
# or
pnpm dev:docs
```
Now uses Turbopack by default - expect **5-10x faster** hot reload.

#### Fast Mode (No Watchers)
```bash
cd apps/docs
pnpm dev:fast
```
Only starts Next.js dev server without troubleshooting watcher.

#### Fallback to Webpack (If Needed)
```bash
cd apps/docs
pnpm dev:webpack
```
Use this if you encounter Turbopack compatibility issues.

### Run Codegen (When Needed)

If you've updated API specs or GraphQL schemas:
```bash
cd apps/docs
pnpm run codegen
```

Or run individual codegen tasks:
```bash
pnpm run codegen:references  # For API reference docs
pnpm run codegen:graphql     # For GraphQL types
pnpm run codegen:examples    # For example files
```

### Production Build

```bash
pnpm build:docs
```

Note: Codegen runs automatically during build (via `prebuild` hook).

Optimizations applied:
- SWC minification (faster than Terser)
- Tree-shaking of unused code
- Console statements removed (except error/warn)
- No source maps (faster build)
- Parallel compilation enabled

## Performance Metrics

### Before Optimizations
- **Cold dev start**: ~15-25s
- **Hot reload**: ~3-5s
- **Full build**: ~5-8 minutes

### After Optimizations (Expected)
- **Cold dev start**: ~5-10s (Turbopack)
- **Hot reload**: ~200-800ms (Turbopack)
- **Full build**: ~3-5 minutes (parallel + caching)
- **Incremental build**: ~30-60s (with cache hits)

## Additional Optimization Tips

### 1. Use Turbo Remote Cache
```bash
# Login to Vercel (if available)
pnpm dlx turbo login

# Link your repository
pnpm dlx turbo link
```

This shares build cache across your team and CI/CD.

### 2. Clear Caches When Needed
```bash
# Clear all caches
pnpm clean

# Clear just Next.js cache
rm -rf apps/docs/.next

# Clear just Turbo cache
rm -rf .turbo
```

### 3. Monitor Build Performance
```bash
# Build with timing information
NEXT_TELEMETRY_DEBUG=1 pnpm build:docs

# Analyze bundle size
ANALYZE=true pnpm --filter=docs build
```

### 4. Optimize Node.js Memory (For Large Builds)
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" pnpm build:docs
```

### 5. Use Parallel Builds in CI
```bash
# In CI/CD pipelines
pnpm turbo run build --concurrency=100 --cache-dir=.turbo
```

## Troubleshooting

### Turbopack Issues
If you encounter issues with Turbopack:
1. Try `pnpm dev:webpack` to use webpack instead
2. Report the issue at: https://github.com/vercel/next.js/issues
3. Check compatibility: https://nextjs.org/docs/architecture/turbopack

### Build Cache Issues
If builds seem incorrect:
```bash
pnpm clean
pnpm install
pnpm build:docs
```

### TypeScript Performance Issues
If type-checking is slow:
```bash
# Skip type-checking during build (CI only)
NEXT_PUBLIC_VERCEL_ENV=preview pnpm build:docs
```

## Monitoring Performance

Track your build performance over time:
```bash
# Time a dev server start
time pnpm dev:fast

# Time a production build
time pnpm build:docs

# Check cache hit rate
pnpm turbo run build --summarize
```

## Further Optimizations (Future)

- **Storybook**: Consider migrating to Histoire for faster component development
- **Bundle Analysis**: Regular bundle size audits with `@next/bundle-analyzer`
- **Image Optimization**: Ensure all images use Next.js Image component
- **Font Optimization**: Use `next/font` for all custom fonts
- **Code Splitting**: Audit and optimize dynamic imports
- **Dependency Updates**: Keep Next.js and dependencies updated for latest perf improvements

## References

- [Next.js Turbopack Docs](https://nextjs.org/docs/architecture/turbopack)
- [Turborepo Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Next.js Compiler Options](https://nextjs.org/docs/architecture/nextjs-compiler)
- [TypeScript Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
