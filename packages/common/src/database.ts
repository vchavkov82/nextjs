import { Pool } from 'pg'
import { createHash } from 'crypto'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'localdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Create a singleton pool instance
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig)

    // Handle pool errors
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })

    pool.on('connect', (client) => {
      console.log('New client connected to database')
    })

    pool.on('remove', (client) => {
      console.log('Client removed from pool')
    })
  }

  return pool
}

// Database query helper
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    }
  } finally {
    client.release()
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// User authentication helpers
export class AuthService {
  static async createUser(email: string, password: string): Promise<any> {
    const passwordHash = this.hashPassword(password)

    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    )

    return result.rows[0]
  }

  static async authenticateUser(email: string, password: string): Promise<any | null> {
    const result = await query(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    const isValidPassword = this.verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    // Remove password hash from response
    delete user.password_hash
    return user
  }

  static async createSession(userId: number): Promise<string> {
    const token = this.generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    )

    return token
  }

  static async validateSession(token: string): Promise<any | null> {
    const result = await query(
      `SELECT s.*, u.email, u.created_at as user_created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [token]
    )

    return result.rows[0] || null
  }

  static async invalidateSession(token: string): Promise<void> {
    await query('DELETE FROM sessions WHERE token = $1', [token])
  }

  private static hashPassword(password: string): string {
    // In a real application, use bcrypt or argon2
    // This is just for demo purposes
    return createHash('sha256').update(password + 'salt').digest('hex')
  }

  private static verifyPassword(password: string, hash: string): boolean {
    const computedHash = this.hashPassword(password)
    return computedHash === hash
  }

  private static generateToken(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
  }
}

// Database health check
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health_check')
    return result.rows[0].health_check === 1
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Close database connection pool
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('Database connection pool closed')
  }
}

// Initialize database tables if they don't exist
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if tables exist
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'sessions', 'posts')
    `)

    const existingTables = result.rows.map(row => row.table_name)

    if (!existingTables.includes('users')) {
      console.log('Creating users table...')
      await query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!existingTables.includes('sessions')) {
      console.log('Creating sessions table...')
      await query(`
        CREATE TABLE sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!existingTables.includes('posts')) {
      console.log('Creating posts table...')
      await query(`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          content TEXT,
          author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}