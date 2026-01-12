import { ApplicationError, UserError, clippy } from 'ai-commands/edge'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Client } from 'pg'

import { isFeatureEnabled } from 'common/enabled-features'

// Note: Using local PostgreSQL instead of Supabase for AI documentation features
export const runtime = 'nodejs'
// Using nodejs runtime for better PostgreSQL connection support

const openAiKey = process.env.OPENAI_API_KEY
const databaseUrl = process.env.DATABASE_URL

/**
 * Simple PostgreSQL RPC query builder for local database
 */
class LocalDatabaseClient {
  private client: Client

  constructor(connectionString: string) {
    this.client = new Client({ connectionString })
  }

  async connect(): Promise<void> {
    await this.client.connect()
  }

  async disconnect(): Promise<void> {
    await this.client.end()
  }

  rpc<T = any>(functionName: string, params: Record<string, any> = {}) {
    return new RpcQuery<T>(this.client, functionName, params)
  }
}

class RpcQuery<T> {
  private client: Client
  private functionName: string
  private params: Record<string, any>
  private filters: Array<{ field: string; operator: string; value: any }> = []
  private selectedFields: string[] = []
  private limitValue: number | null = null

  constructor(client: Client, functionName: string, params: Record<string, any>) {
    this.client = client
    this.functionName = functionName
    this.params = params
  }

  neq(field: string, value: any) {
    this.filters.push({ field, operator: 'neq', value })
    return this
  }

  select(fields: string) {
    this.selectedFields = fields.split(',').map((f) => f.trim())
    return this
  }

  limit(count: number) {
    this.limitValue = count
    return this
  }

  async execute() {
    try {
      const paramString = Object.entries(this.params)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`
          }
          if (Array.isArray(value)) {
            return `'${JSON.stringify(value)}'::jsonb`
          }
          return value
        })
        .join(', ')

      const query = `SELECT * FROM ${this.functionName}(${paramString})`
      const result = await this.client.query<T>(query)

      let data = result.rows as T[]

      for (const filter of this.filters) {
        if (filter.operator === 'neq') {
          data = data.filter((row: any) => row[filter.field] !== filter.value)
        }
      }

      if (this.limitValue !== null) {
        data = data.slice(0, this.limitValue)
      }

      return { error: null, data }
    } catch (error) {
      console.error(`Error calling RPC function ${this.functionName}:`, error)
      return { error, data: null }
    }
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  [Symbol.toStringTag] = 'Promise'
}

export async function POST(req: NextRequest) {
  if (!openAiKey || !databaseUrl) {
    return NextResponse.json(
      { error: 'Missing environment variables for AI features.' },
      { status: 500 }
    )
  }

  const openai = new OpenAI({ apiKey: openAiKey })
  const dbClient = new LocalDatabaseClient(databaseUrl)

  try {
    await dbClient.connect()

    const { messages } = (await req.json()) as {
      messages: { content: string; role: 'user' | 'assistant' }[]
    }

    if (!messages) {
      throw new UserError('Missing messages in request data')
    }

    const useAltSearchIndex = !isFeatureEnabled('search:fullIndex')
    const response = await clippy(openai, dbClient as any, messages, {
      useAltSearchIndex,
    })

    // Proxy the streamed SSE response from OpenAI
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    })
  } catch (error: unknown) {
    console.error(error)
    if (error instanceof UserError) {
      return NextResponse.json({ error: error.message, data: error.data }, { status: 400 })
    } else if (error instanceof ApplicationError) {
      console.error(`${error.message}: ${JSON.stringify(error.data)}`)
    } else {
      console.error(error)
    }

    return NextResponse.json(
      { error: 'There was an error processing your request' },
      { status: 500 }
    )
  } finally {
    await dbClient.disconnect()
  }
}
