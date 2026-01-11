/**
 * Initialize local WebSocket server and database
 * This module is for server-side use only
 */

import { startWebSocketServer } from './websocket-server'
import { initializeDatabase } from './database'

export async function initializeLocalServices(port: number = 8081): Promise<void> {
  try {
    // Initialize database tables if needed
    console.log('🗄️  Initializing database...')
    await initializeDatabase()
    console.log('✅ Database initialized')

    // Start WebSocket server
    console.log(`🔌 Starting WebSocket server on port ${port}...`)
    startWebSocketServer(port)
    console.log(`✅ WebSocket server running on port ${port}`)
  } catch (error) {
    console.error('❌ Failed to initialize local services:', error)
    throw error
  }
}
