# Local PostgreSQL Setup

This setup provides a simple PostgreSQL database running in a container using Podman.

## Quick Start

### Option 1: Using the helper script (Recommended)

```bash
# Start PostgreSQL
./scripts/start-postgres.sh

# Stop PostgreSQL
./scripts/stop-postgres.sh
```

### Option 2: Manual setup

1. Copy the environment file:
   ```bash
   cd docker
   cp postgres.env.example .env
   ```

2. Edit `.env` and update the PostgreSQL credentials if needed.

3. Start PostgreSQL:
   ```bash
   podman compose -f docker-compose.postgres.yml up -d
   ```

4. Verify it's running:
   ```bash
   podman compose -f docker-compose.postgres.yml ps
   ```

5. Connect to the database:
   ```bash
   podman compose -f docker-compose.postgres.yml exec postgres psql -U postgres -d postgres
   ```

   Or from your host machine (if using default port):
   ```bash
   psql -h localhost -p 5432 -U postgres -d postgres
   ```

## Connection String

Use this connection string in your application:

```
postgresql://postgres:postgres@localhost:5432/postgres
```

Or with environment variables:
```
postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

## Stop PostgreSQL

```bash
podman compose -f docker-compose.postgres.yml down
```

## Remove All Data

To remove the container and all data:

```bash
podman compose -f docker-compose.postgres.yml down -v
```

## Environment Variables

- `POSTGRES_USER`: Database user (default: `postgres`)
- `POSTGRES_PASSWORD`: Database password (default: `postgres`)
- `POSTGRES_DB`: Database name (default: `postgres`)
- `POSTGRES_PORT`: Port to expose (default: `5432`)
- `POSTGRES_HOST`: Host for connections (default: `localhost`)
