# Local Development Setup (No Supabase)

This project has been converted from using Supabase to a fully local setup using PostgreSQL and custom WebSocket services.

## 🚀 Quick Start

1. **Start local services:**
   ```bash
   ./scripts/start-local-services.sh
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env-local-template .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

## 📋 Services

### PostgreSQL Database
- **Container:** `local-postgres`
- **Host Port:** `5433` (container port `5432`)
- **Database:** `localdb`
- **Username:** `postgres`
- **Password:** `password`
- **PgAdmin:** http://localhost:8080 (admin@localhost / admin)

### WebSocket Server
- **Port:** `8081`
- **Protocol:** WebSocket (ws://)
- **Features:** Authentication, channels, broadcasting

### Next.js Application
- **Port:** `3000`
- **Framework:** Next.js with App Router

## 🗄️ Database Schema

The local database includes these tables:

- **users:** User accounts with authentication
- **sessions:** User sessions for authentication
- **posts:** Example content table

Tables are automatically created when the database starts.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=localdb
DB_USER=postgres
DB_PASSWORD=password

# WebSocket Server Configuration
WS_PORT=8081

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8081

# Development Settings
NODE_ENV=development
DEBUG=true

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_MAX_AGE=86400000
```

## 🛠️ Development Scripts

### Start All Services
```bash
./scripts/start-local-services.sh
```

### Stop Services
```bash
podman-compose -f docker-compose.local.yml down
```

### Test WebSocket Connection
```bash
node scripts/test-websocket.js
```

### Database Management
```bash
# Connect to database
psql -h localhost -p 5433 -U postgres -d localdb

# View logs
podman-compose -f docker-compose.local.yml logs postgres

# Reset database
podman-compose -f docker-compose.local.yml down -v
podman-compose -f docker-compose.local.yml up -d postgres
```

## 🔌 Realtime (WebSocket) Usage

### Supabase Realtime Compatibility

The application uses a **Realtime Adapter** that provides a Supabase-compatible API over the local WebSocket infrastructure. No component changes needed - existing Supabase Realtime code works unchanged.

#### Using Supabase Client (Recommended)
```typescript
import { createClient } from '@supabase/supabase-js'

// The client is automatically redirected to use local WebSocket
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Works exactly like Supabase Realtime
const channel = supabase
  .channel('chat-room-1')
  .on('broadcast', { event: 'message' }, (payload) => {
    console.log('Message:', payload)
  })
  .subscribe()

// Send a message
channel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text: 'Hello!' }
})

// Track presence
await channel.track({ user_id: 1, name: 'Bob' })

// Get presence state
const presenceState = channel.presenceState()
```

#### Direct WebSocket Client (Advanced)
For more control, use the local WebSocket client directly:

```typescript
import { createLocalWebSocketClient } from 'common'

const wsClient = createLocalWebSocketClient()

// Connect
await wsClient.connect()

// Authenticate (if needed)
await wsClient.authenticate(sessionToken)

// Subscribe to channels
wsClient.subscribe('chat-room-1')

// Listen for messages
wsClient.on('broadcast', (message) => {
  console.log('Received:', message)
})

// Send messages
wsClient.broadcast('chat-room-1', { text: 'Hello!' })

// Disconnect
wsClient.disconnect()
```

### Server Features
- **Authentication:** JWT-based session validation
- **Channels:** Subscribe/unsubscribe to topics
- **Broadcasting:** Send messages to channel subscribers
- **Heartbeat:** Automatic connection health monitoring
- **Reconnection:** Automatic reconnection on disconnection

## 🔒 Authentication

The local setup includes a simple authentication system:

- **Registration:** `AuthService.createUser(email, password)`
- **Login:** `AuthService.authenticateUser(email, password)`
- **Sessions:** JWT-like tokens stored in database

## 📊 Database Operations

### Query Builder
```typescript
import { query, transaction } from '@common/database'

// Simple query
const users = await query('SELECT * FROM users WHERE email = $1', [email])

// Transaction
await transaction(async (client) => {
  await client.query('INSERT INTO posts (title, content) VALUES ($1, $2)', [title, content])
  await client.query('UPDATE users SET post_count = post_count + 1 WHERE id = $1', [userId])
})
```

### Health Check
```typescript
import { healthCheck } from '@common/database'

const isHealthy = await healthCheck()
console.log('Database healthy:', isHealthy)
```

## 🐳 Podman Commands

### View Running Containers
```bash
podman ps
```

### View Container Logs
```bash
podman logs local-postgres
podman logs local-pgadmin
```

### Access Database Directly
```bash
podman exec -it local-postgres psql -U postgres -d localdb
```

### Clean Up
```bash
# Stop and remove containers
podman-compose -f docker-compose.local.yml down

# Remove volumes (WARNING: deletes data)
podman-compose -f docker-compose.local.yml down -v
```

## 🐛 Troubleshooting

### Database Connection Issues
1. Check if PostgreSQL container is running: `podman ps`
2. Check container logs: `podman logs local-postgres`
3. Verify environment variables in `.env.local`
4. Test connection: `psql -h localhost -p 5433 -U postgres -d localdb`

### WebSocket Connection Issues
1. Check if WebSocket server is running
2. Test connection: `node scripts/test-websocket.js`
3. Check browser console for errors
4. Verify WS_PORT in environment variables

### Port Conflicts
If ports are already in use, modify the docker-compose.local.yml file:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Change host port from 5432 to 5433
  pgadmin:
    ports:
      - "8081:80"    # Change host port from 8080 to 8081
```

Update your `.env.local` accordingly.

## 🔄 Migration from Supabase

This setup replaces the following Supabase features:

| Supabase Feature | Local Replacement |
|------------------|-------------------|
| Database | PostgreSQL in Podman container |
| Authentication | Custom AuthService with database sessions |
| Realtime | Custom Realtime Adapter over WebSocket |
| Storage | Local file system (can be added later) |
| Edge Functions | Local Node.js/Express server (can be added later) |

### Realtime Adapter Details

The **Realtime Adapter** (`packages/common/src/realtime-adapter.ts`) provides a Supabase-compatible API:

- **Channels:** `.channel(name, config)`
- **Broadcast:** `.send({ type: 'broadcast', event: 'X', payload: data })`
- **Presence:** `.track(state)` and `.presenceState()`
- **Subscriptions:** `.subscribe(callback)` and `.unsubscribe()`
- **Event Handlers:** `.on('broadcast' | 'presence', filter, callback)`

All existing components using Supabase Realtime work without modification through Webpack alias redirection.

## 📚 API Reference

### Database (`packages/common/src/database.ts`)
- `getPool()`: Get PostgreSQL connection pool
- `query(text, params)`: Execute SQL queries
- `transaction(callback)`: Execute queries in transaction
- `AuthService`: User authentication utilities
- `healthCheck()`: Database connectivity check

### WebSocket (`packages/common/src/websocket.ts`)
- `createLocalWebSocketClient(url)`: Create WebSocket client
- `LocalWebSocketClient`: WebSocket client class
- `testLocalWebSocketConnection(url)`: Test WebSocket connectivity

### WebSocket Server (`packages/common/src/websocket-server.ts`)
- `LocalWebSocketServer`: WebSocket server implementation
- `startWebSocketServer(port)`: Start WebSocket server
- `getWebSocketServer()`: Get running server instance

## 🤝 Contributing

When making changes:

1. Update database schema in `init.sql`
2. Update TypeScript interfaces if needed
3. Test with both database and WebSocket services running
4. Update this README if adding new features

## 📝 Notes

- This is a development setup - production deployments will need different configurations
- Database data persists in Podman volumes between container restarts
- WebSocket server runs in the application process - consider extracting to separate service for production
- Authentication uses simple password hashing - use proper encryption for production