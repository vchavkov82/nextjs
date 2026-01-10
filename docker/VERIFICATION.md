# PostgreSQL Setup Verification

## ✅ Confirmation: You CAN Use Local PostgreSQL

Based on the codebase analysis, **your Studio app is already configured to use local PostgreSQL** when running in self-hosted mode.

## Current Configuration

### Studio App (apps/studio)

The Studio app has a **self-hosted mode** that uses direct PostgreSQL connections:

**Connection Settings** (`apps/studio/lib/api/self-hosted/constants.ts`):
- `POSTGRES_HOST` - defaults to `'db'` (change to `'localhost'` for local dev)
- `POSTGRES_PORT` - defaults to `5432`
- `POSTGRES_DB` - defaults to `'postgres'`
- `POSTGRES_PASSWORD` - defaults to `'postgres'`
- `POSTGRES_USER_READ_WRITE` - defaults to `'supabase_admin'`
- `POSTGRES_USER_READ_ONLY` - defaults to `'supabase_read_only_user'`

**Mode Detection** (`apps/studio/lib/constants/index.ts`):
- When `IS_PLATFORM=false` or `NEXT_PUBLIC_IS_PLATFORM` is not set to `'true'`, the app runs in self-hosted mode
- In self-hosted mode, it connects directly to PostgreSQL using the above environment variables

## Required Setup

### 1. Start PostgreSQL

```bash
./scripts/start-postgres.sh
```

Or manually:
```bash
cd docker
podman compose -f docker-compose.postgres.yml up -d
```

### 2. Configure Studio Environment Variables

Create or update your Studio app's environment variables:

```bash
# In apps/studio/.env.local or root .env
NEXT_PUBLIC_IS_PLATFORM=false
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_USER_READ_WRITE=postgres
POSTGRES_USER_READ_ONLY=postgres
```

### 3. Verify Connection

Run the verification script:
```bash
./scripts/verify-postgres-setup.sh
```

## Supabase Dependencies Analysis

### ✅ No Supabase Dependencies in Studio App

The Studio app does **NOT** depend on Supabase services when in self-hosted mode:
- Uses direct PostgreSQL connections via `pg` or connection strings
- No Supabase client library calls in core functionality
- Self-hosted mode bypasses all Supabase API calls

### ⚠️ Other Apps Still Have Supabase References

**apps/www** and **apps/docs** still have Supabase client imports, but these are:
- Documentation/content apps (not core Studio functionality)
- Used for demo/examples, not critical to Studio operation

If you're only using the Studio app, you can ignore these.

## Connection String

Your local PostgreSQL connection string:
```
postgresql://postgres:postgres@localhost:5432/postgres
```

## Verification Checklist

- [ ] PostgreSQL container is running (`podman compose -f docker-compose.postgres.yml ps`)
- [ ] Can connect to database (`psql -h localhost -p 5432 -U postgres -d postgres`)
- [ ] Studio app has `NEXT_PUBLIC_IS_PLATFORM=false` or unset
- [ ] Studio app has PostgreSQL environment variables set
- [ ] Studio app connects to local PostgreSQL (not Supabase)

## Summary

**YES, you are using local PostgreSQL** when:
1. PostgreSQL container is running (via `docker-compose.postgres.yml`)
2. `IS_PLATFORM=false` or `NEXT_PUBLIC_IS_PLATFORM` is not `'true'`
3. PostgreSQL environment variables are set correctly

**You do NOT depend on Supabase** for the Studio app's core functionality in self-hosted mode.
