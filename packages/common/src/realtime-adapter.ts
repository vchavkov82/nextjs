import { LocalWebSocketClient } from './websocket'

export type RealtimeChannelState = 'closed' | 'joining' | 'joined' | 'leaving' | 'errored'

export type RealtimeSubscribeState = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'

export interface RealtimePresenceState {
  [key: string]: Array<{
    user_id?: string
    [key: string]: any
  }>
}

interface EventCallback {
  (message: any): void
}

interface PresenceEventMessage {
  channel: string
  event: string
  key?: string
  newPresence?: any[]
  leftPresences?: any[]
}

/**
 * Supabase-compatible Realtime Channel
 * Wraps LocalWebSocketClient to provide the same API surface
 */
export class RealtimeChannel {
  private client: LocalWebSocketClient
  private channelName: string
  private config: any
  private presenceState: RealtimePresenceState = {}
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map()
  private subscriptionCallbacks: Set<(state: RealtimeSubscribeState) => void> = new Set()
  private subscribed = false
  private state: RealtimeChannelState = 'closed'

  constructor(client: LocalWebSocketClient, channelName: string, config?: any) {
    this.client = client
    this.channelName = channelName
    this.config = config || {}
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    // Listen for broadcast messages
    this.client.on('broadcast', (message: any) => {
      if (message.channel === this.channelName) {
        // Extract event type from payload
        const eventName = message.payload?.event || 'message'
        this.emit('broadcast', {
          channel: this.channelName,
          event: eventName,
          payload: message.payload,
        })
      }
    })

    // Listen for user joined events
    this.client.on('user_joined', (message: any) => {
      if (message.channel === this.channelName) {
        const userId = message.payload?.userId || message.payload?.clientId
        const userState = message.payload || {}

        // Update presence state
        if (!this.presenceState[userId]) {
          this.presenceState[userId] = []
        }
        this.presenceState[userId].push(userState)

        // Emit presence event
        this.emit('presence', {
          channel: this.channelName,
          event: 'sync',
          newPresences: [{ id: userId, ...userState }],
        } as PresenceEventMessage)
      }
    })

    // Listen for user left events
    this.client.on('user_left', (message: any) => {
      if (message.channel === this.channelName) {
        const userId = message.payload?.userId || message.payload?.clientId

        // Update presence state
        if (this.presenceState[userId]) {
          const leftPresences = this.presenceState[userId]
          delete this.presenceState[userId]

          // Emit presence event
          this.emit('presence', {
            channel: this.channelName,
            event: 'sync',
            leftPresences: leftPresences.map((p: any) => ({ id: userId, ...p })),
          } as PresenceEventMessage)
        }
      }
    })
  }

  private emit(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data)
        } catch (error) {
          console.error(`Error in ${event} callback:`, error)
        }
      })
    }
  }

  private notifySubscription(state: RealtimeSubscribeState) {
    this.subscriptionCallbacks.forEach((cb) => {
      try {
        cb(state)
      } catch (error) {
        console.error('Error in subscription callback:', error)
      }
    })
  }

  /**
   * Subscribe to channel events
   * Matches Supabase Realtime API: channel.subscribe(callback?)
   */
  subscribe(callback?: (status: RealtimeSubscribeState) => void): this {
    if (callback) {
      this.subscriptionCallbacks.add(callback)
    }

    if (!this.subscribed) {
      this.subscribed = true
      this.state = 'joining'

      // Subscribe to the channel on WebSocket
      try {
        this.client.subscribe(this.channelName)
        // Simulate subscription success
        setTimeout(() => {
          this.state = 'joined'
          this.notifySubscription('SUBSCRIBED')
        }, 0)
      } catch (error) {
        this.state = 'errored'
        this.notifySubscription('CHANNEL_ERROR')
      }
    }

    return this
  }

  /**
   * Unsubscribe from channel
   * Matches Supabase Realtime API: channel.unsubscribe()
   */
  unsubscribe(): void {
    if (this.subscribed) {
      this.state = 'leaving'
      this.client.unsubscribe(this.channelName)
      this.state = 'closed'
      this.subscribed = false
      this.eventCallbacks.clear()
      this.subscriptionCallbacks.clear()
      this.presenceState = {}
    }
  }

  /**
   * Listen to channel events
   * Matches Supabase Realtime API: channel.on(event, {event: 'X'}, callback)
   */
  on(
    event: 'broadcast' | 'presence' | 'postgres_changes',
    filter: any,
    callback: EventCallback
  ): this {
    // For broadcast and presence, we filter by event name in the callback
    if (event === 'broadcast' || event === 'presence') {
      const eventName = filter?.event || event
      const key = `${event}:${eventName}`

      if (!this.eventCallbacks.has(key)) {
        this.eventCallbacks.set(key, new Set())
      }

      // Store the callback with filter information
      const wrappedCallback = (message: any) => {
        // Check if this message matches the filter
        if (filter?.event && message.event !== filter.event) {
          return // Skip if event doesn't match
        }
        // Pass the message to the original callback
        callback(message)
      }

      this.eventCallbacks.get(key)!.add(wrappedCallback)
    }

    return this
  }

  /**
   * Send a broadcast message
   * Matches Supabase Realtime API: channel.send({type: 'broadcast', event: 'X', payload: data})
   */
  send(message: { type: string; event: string; payload?: any }): void {
    if (!this.subscribed) {
      console.warn('Cannot send message: not subscribed to channel')
      return
    }

    if (message.type === 'broadcast') {
      this.client.broadcast(this.channelName, {
        event: message.event,
        ...message.payload,
      })
    }
  }

  /**
   * Update presence state
   * Matches Supabase Realtime API: channel.track(state)
   */
  async track(presenceState: any): Promise<void> {
    if (!this.subscribed) {
      throw new Error('Cannot track presence: not subscribed to channel')
    }

    // Send presence update as a special broadcast message
    this.client.broadcast(this.channelName, {
      type: 'presence',
      payload: presenceState,
    })
  }

  /**
   * Get current presence state
   * Matches Supabase Realtime API: channel.presenceState()
   */
  presenceState(): RealtimePresenceState {
    return { ...this.presenceState }
  }

  /**
   * Get channel state
   */
  get currentState(): RealtimeChannelState {
    return this.state
  }
}

/**
 * Supabase-compatible Realtime Adapter
 * Provides channel management and factory for RealtimeChannel instances
 */
export class RealtimeAdapter {
  private wsClient: LocalWebSocketClient
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor(wsUrl?: string) {
    const url = wsUrl || (typeof window !== 'undefined' ? 'ws://localhost:8081' : '')
    this.wsClient = new LocalWebSocketClient(url)
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (!this.wsClient.isConnected()) {
      await this.wsClient.connect()
    }
  }

  /**
   * Create or get a channel
   * Matches Supabase Realtime API: supabase.channel(name, config?)
   */
  channel(name: string, config?: any): RealtimeChannel {
    let channel = this.channels.get(name)

    if (!channel) {
      channel = new RealtimeChannel(this.wsClient, name, config)
      this.channels.set(name, channel)
    }

    return channel
  }

  /**
   * Remove a channel
   * Matches Supabase Realtime API: supabase.removeChannel(channel)
   */
  removeChannel(channel: RealtimeChannel): void {
    for (const [name, ch] of this.channels) {
      if (ch === channel) {
        ch.unsubscribe()
        this.channels.delete(name)
        break
      }
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    // Unsubscribe from all channels
    for (const channel of this.channels.values()) {
      channel.unsubscribe()
    }
    this.channels.clear()
    this.wsClient.disconnect()
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.wsClient.isConnected()
  }
}
