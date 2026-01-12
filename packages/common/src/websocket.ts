// Local WebSocket client for connecting to the local WebSocket server
export class LocalWebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()
  private channels: Set<string> = new Set()
  private authenticated = false
  private authToken: string | null = null

  constructor(url: string = 'ws://localhost:8081') {
    this.url = url
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.stopHeartbeat()
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        // Set connection timeout
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close()
            reject(new Error('Connection timeout'))
          }
        }, 5000)

      } catch (error) {
        reject(error)
      }
    })
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
  }

  public async authenticate(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'))
        return
      }

      this.authToken = token

      this.ws.send(JSON.stringify({
        type: 'authenticate',
        payload: { token }
      }))

      // Listen for authentication response
      const authHandler = (data: any) => {
        if (data.type === 'authenticated') {
          this.authenticated = true
          this.off('message', authHandler)
          resolve()
        } else if (data.type === 'auth_error') {
          this.off('message', authHandler)
          reject(new Error(data.payload.message))
        }
      }

      this.on('message', authHandler)

      // Timeout
      setTimeout(() => {
        this.off('message', authHandler)
        reject(new Error('Authentication timeout'))
      }, 5000)
    })
  }

  public subscribe(channel: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }

    this.channels.add(channel)
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      channel
    }))
  }

  public unsubscribe(channel: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }

    this.channels.delete(channel)
    this.ws.send(JSON.stringify({
      type: 'unsubscribe',
      channel
    }))
  }

  public broadcast(channel: string, payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }

    this.ws.send(JSON.stringify({
      type: 'broadcast',
      channel,
      payload
    }))
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  public off(event: string, callback?: (data: any) => void): void {
    if (!this.eventListeners.has(event)) return

    if (callback) {
      const listeners = this.eventListeners.get(event)!
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(event)
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)
      this.emit('message', message)

      // Handle specific message types
      switch (message.type) {
        case 'welcome':
          console.log('Received welcome message:', message.payload)
          break
        case 'subscribed':
          console.log(`Subscribed to channel: ${message.channel}`)
          break
        case 'broadcast':
          this.emit('broadcast', message)
          break
        case 'user_joined':
          this.emit('user_joined', message)
          break
        case 'user_left':
          this.emit('user_left', message)
          break
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send ping to keep connection alive (ws library only)
        if (typeof (this.ws as any).ping === 'function') {
          (this.ws as any).ping()
        }
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('max_reconnect_attempts_reached', {})
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000)

    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      this.connect().then(() => {
        // Re-authenticate if we had a token
        if (this.authToken) {
          this.authenticate(this.authToken).catch(console.error)
        }

        // Re-subscribe to channels
        const channels = Array.from(this.channels)
        for (const channel of channels) {
          this.subscribe(channel)
        }
      }).catch((error) => {
        console.error('Reconnection failed:', error)
        this.attemptReconnect()
      })
    }, delay)
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  public isAuthenticated(): boolean {
    return this.authenticated
  }

  public getSubscribedChannels(): string[] {
    return Array.from(this.channels)
  }
}

// Factory function for creating WebSocket clients
export function createLocalWebSocketClient(url?: string): LocalWebSocketClient {
  return new LocalWebSocketClient(url)
}

// WebSocket connection test utility
export async function testLocalWebSocketConnection(url: string = 'ws://localhost:8081'): Promise<{
  success: boolean
  error?: string
  latency?: number
}> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    try {
      const ws = new WebSocket(url)

      const timeout = setTimeout(() => {
        ws.close()
        resolve({
          success: false,
          error: 'Connection timeout after 5 seconds'
        })
      }, 5000)

      ws.onopen = () => {
        clearTimeout(timeout)
        const latency = Date.now() - startTime
        ws.close()
        resolve({
          success: true,
          latency
        })
      }

      ws.onerror = (error) => {
        clearTimeout(timeout)
        resolve({
          success: false,
          error: 'WebSocket connection failed'
        })
      }

      ws.onclose = (event) => {
        if (!event.wasClean && event.code !== 1000) {
          resolve({
            success: false,
            error: `Connection closed unexpectedly: ${event.code} ${event.reason}`
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      resolve({
        success: false,
        error: `Failed to create WebSocket: ${errorMessage}`
      })
    }
  })
}
