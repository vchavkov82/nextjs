import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { query } from './database'

interface WebSocketClient extends WebSocket {
  id: string
  userId?: number
  subscribedChannels: Set<string>
}

interface WebSocketMessage {
  type: string
  channel?: string
  payload?: any
  userId?: number
}

export class LocalWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients = new Map<string, WebSocketClient>()
  private channels = new Map<string, Set<WebSocketClient>>()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(port: number = 8081) {
    this.start(port)
  }

  private start(port: number) {
    this.wss = new WebSocketServer({ port })

    console.log(`WebSocket server started on port ${port}`)

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request)
    })

    // Start heartbeat to detect dead connections
    this.startHeartbeat()
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const clientId = this.generateClientId()
    const client = ws as WebSocketClient

    client.id = clientId
    client.subscribedChannels = new Set()

    this.clients.set(clientId, client)
    console.log(`Client ${clientId} connected`)

    ws.on('message', (data: Buffer) => {
      this.handleMessage(client, data)
    })

    ws.on('close', () => {
      this.handleDisconnection(client)
    })

    ws.on('error', (error) => {
      console.error(`Client ${clientId} error:`, error)
      this.handleDisconnection(client)
    })

    // Send welcome message
    this.sendToClient(client, {
      type: 'welcome',
      payload: { clientId }
    })
  }

  private handleMessage(client: WebSocketClient, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString())

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(client, message.channel!)
          break
        case 'unsubscribe':
          this.handleUnsubscribe(client, message.channel!)
          break
        case 'broadcast':
          this.handleBroadcast(client, message)
          break
        case 'authenticate':
          this.handleAuthentication(client, message)
          break
        default:
          console.log(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      this.sendToClient(client, {
        type: 'error',
        payload: { message: 'Invalid message format' }
      })
    }
  }

  private handleSubscribe(client: WebSocketClient, channel: string) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set())
    }

    this.channels.get(channel)!.add(client)
    client.subscribedChannels.add(channel)

    console.log(`Client ${client.id} subscribed to channel: ${channel}`)

    this.sendToClient(client, {
      type: 'subscribed',
      channel,
      payload: { success: true }
    })

    // Notify others in the channel
    this.broadcastToChannel(channel, {
      type: 'user_joined',
      channel,
      payload: { userId: client.userId, clientId: client.id }
    }, client)
  }

  private handleUnsubscribe(client: WebSocketClient, channel: string) {
    const channelClients = this.channels.get(channel)
    if (channelClients) {
      channelClients.delete(client)
      if (channelClients.size === 0) {
        this.channels.delete(channel)
      }
    }

    client.subscribedChannels.delete(channel)

    console.log(`Client ${client.id} unsubscribed from channel: ${channel}`)

    this.sendToClient(client, {
      type: 'unsubscribed',
      channel,
      payload: { success: true }
    })
  }

  private handleBroadcast(client: WebSocketClient, message: WebSocketMessage) {
    const { channel } = message
    if (!channel || !client.subscribedChannels.has(channel)) {
      this.sendToClient(client, {
        type: 'error',
        payload: { message: 'Not subscribed to channel' }
      })
      return
    }

    this.broadcastToChannel(channel, {
      type: 'broadcast',
      channel,
      payload: message.payload,
      userId: client.userId
    })
  }

  private async handleAuthentication(client: WebSocketClient, message: WebSocketMessage) {
    const { token } = message.payload || {}

    if (!token) {
      this.sendToClient(client, {
        type: 'auth_error',
        payload: { message: 'No token provided' }
      })
      return
    }

    try {
      // Validate session token (this would be your session validation logic)
      const result = await query(
        'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
        [token]
      )

      if (result.rows.length > 0) {
        client.userId = result.rows[0].user_id
        this.sendToClient(client, {
          type: 'authenticated',
          payload: { userId: client.userId }
        })
      } else {
        this.sendToClient(client, {
          type: 'auth_error',
          payload: { message: 'Invalid token' }
        })
      }
    } catch (error) {
      console.error('Authentication error:', error)
      this.sendToClient(client, {
        type: 'auth_error',
        payload: { message: 'Authentication failed' }
      })
    }
  }

  private handleDisconnection(client: WebSocketClient) {
    console.log(`Client ${client.id} disconnected`)

    // Remove from all channels
    for (const channel of client.subscribedChannels) {
      const channelClients = this.channels.get(channel)
      if (channelClients) {
        channelClients.delete(client)
        if (channelClients.size === 0) {
          this.channels.delete(channel)
        }

        // Notify others in the channel
        this.broadcastToChannel(channel, {
          type: 'user_left',
          channel,
          payload: { userId: client.userId, clientId: client.id }
        })
      }
    }

    this.clients.delete(client.id)
  }

  private broadcastToChannel(channel: string, message: WebSocketMessage, excludeClient?: WebSocketClient) {
    const channelClients = this.channels.get(channel)
    if (!channelClients) return

    for (const client of channelClients) {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message)
      }
    }
  }

  private sendToClient(client: WebSocketClient, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          // Send ping
          client.ping()

          // Set a timeout for pong response
          const timeout = setTimeout(() => {
            console.log(`Client ${clientId} ping timeout, disconnecting`)
            client.terminate()
          }, 5000)

          client.once('pong', () => {
            clearTimeout(timeout)
          })
        }
      }
    }, 30000) // Ping every 30 seconds
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      channels: Array.from(this.channels.keys()),
      channelCounts: Object.fromEntries(
        Array.from(this.channels.entries()).map(([channel, clients]) => [
          channel,
          clients.size
        ])
      )
    }
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    if (this.wss) {
      this.wss.close()
      console.log('WebSocket server closed')
    }
  }
}

// Singleton instance
let websocketServer: LocalWebSocketServer | null = null

export function startWebSocketServer(port: number = 8081): LocalWebSocketServer {
  if (!websocketServer) {
    websocketServer = new LocalWebSocketServer(port)
  }
  return websocketServer
}

export function getWebSocketServer(): LocalWebSocketServer | null {
  return websocketServer
}

export function stopWebSocketServer(): void {
  if (websocketServer) {
    websocketServer.close()
    websocketServer = null
  }
}