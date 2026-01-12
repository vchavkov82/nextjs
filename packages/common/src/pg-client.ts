import { Client, QueryResult } from 'pg'

/**
 * Local PostgreSQL client wrapper that mimics Supabase client interface
 * This allows us to use local PostgreSQL instead of Supabase
 */

interface RpcResponse<T> {
  error: any | null
  data: T | null
}

class PostgreSQLClient {
  private client: Client
  private connected = false

  constructor(connectionString?: string) {
    const dbUrl =
      connectionString ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/postgres'

    this.client = new Client({
      connectionString: dbUrl,
    })
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect()
      this.connected = true
      console.log('Connected to PostgreSQL')
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.end()
      this.connected = false
      console.log('Disconnected from PostgreSQL')
    }
  }

  /**
   * Call a PostgreSQL RPC function
   * Mimics Supabase's .rpc() interface
   */
  rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {}
  ): RpcQueryBuilder<T> {
    return new RpcQueryBuilder<T>(this.client, functionName, params)
  }

  /**
   * Query a table (mimics Supabase's .from().select() interface)
   */
  from(tableName: string): TableQueryBuilder {
    return new TableQueryBuilder(this.client, tableName)
  }

  /**
   * Direct query execution
   */
  async query<T = any>(
    sql: string,
    values?: any[]
  ): Promise<QueryResult<T>> {
    if (!this.connected) {
      await this.connect()
    }
    return this.client.query<T>(sql, values)
  }
}

class RpcQueryBuilder<T> {
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

  /**
   * Filter for not equal
   */
  neq(field: string, value: any): this {
    this.filters.push({ field, operator: 'neq', value })
    return this
  }

  /**
   * Select specific columns
   */
  select(fields: string): this {
    this.selectedFields = fields.split(',').map((f) => f.trim())
    return this
  }

  /**
   * Limit results
   */
  limit(count: number): this {
    this.limitValue = count
    return this
  }

  /**
   * Execute the query
   */
  async execute(): Promise<RpcResponse<T[]>> {
    try {
      // Build the RPC call with parameters
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

      // Apply client-side filtering for neq
      for (const filter of this.filters) {
        if (filter.operator === 'neq') {
          data = data.filter((row: any) => row[filter.field] !== filter.value)
        }
      }

      // Apply limit
      if (this.limitValue !== null) {
        data = data.slice(0, this.limitValue)
      }

      return { error: null, data }
    } catch (error) {
      console.error(`Error calling RPC function ${this.functionName}:`, error)
      return {
        error,
        data: null,
      }
    }
  }

  /**
   * Make the builder awaitable
   */
  then(
    onFulfilled?: (value: RpcResponse<T[]>) => any,
    onRejected?: (reason?: any) => any
  ): Promise<RpcResponse<T[]>> {
    return this.execute().then(onFulfilled, onRejected)
  }

  /**
   * Support async/await
   */
  [Symbol.toStringTag] = 'Promise'
}

class TableQueryBuilder {
  private client: Client
  private tableName: string

  constructor(client: Client, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  select(fields = '*') {
    return new SelectBuilder(this.client, this.tableName, fields)
  }

  insert(data: any[]) {
    return new InsertBuilder(this.client, this.tableName, data)
  }

  update(data: Record<string, any>) {
    return new UpdateBuilder(this.client, this.tableName, data)
  }

  delete() {
    return new DeleteBuilder(this.client, this.tableName)
  }
}

class SelectBuilder {
  private client: Client
  private tableName: string
  private fields: string
  private filters: Array<{ field: string; operator: string; value: any }> = []
  private limitValue: number | null = null
  private orderByField: string | null = null
  private orderByDirection: 'ASC' | 'DESC' = 'ASC'

  constructor(client: Client, tableName: string, fields: string) {
    this.client = client
    this.tableName = tableName
    this.fields = fields
  }

  eq(field: string, value: any): this {
    this.filters.push({ field, operator: '=', value })
    return this
  }

  neq(field: string, value: any): this {
    this.filters.push({ field, operator: '!=', value })
    return this
  }

  limit(count: number): this {
    this.limitValue = count
    return this
  }

  order(field: string, options?: { ascending?: boolean }): this {
    this.orderByField = field
    this.orderByDirection = options?.ascending === false ? 'DESC' : 'ASC'
    return this
  }

  single() {
    return new SelectSingleBuilder(this.client, this.tableName, this.fields)
  }

  async execute() {
    let query = `SELECT ${this.fields} FROM ${this.tableName}`
    const values: any[] = []
    let paramCount = 1

    if (this.filters.length > 0) {
      const whereClause = this.filters
        .map(({ field, operator, value }) => {
          values.push(value)
          return `${field} ${operator} $${paramCount++}`
        })
        .join(' AND ')
      query += ` WHERE ${whereClause}`
    }

    if (this.orderByField) {
      query += ` ORDER BY ${this.orderByField} ${this.orderByDirection}`
    }

    if (this.limitValue !== null) {
      query += ` LIMIT ${this.limitValue}`
    }

    const result = await this.client.query(query, values)
    return { error: null, data: result.rows }
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  [Symbol.toStringTag] = 'Promise'
}

class SelectSingleBuilder {
  private client: Client
  private tableName: string
  private fields: string
  private filters: Array<{ field: string; operator: string; value: any }> = []

  constructor(client: Client, tableName: string, fields: string) {
    this.client = client
    this.tableName = tableName
    this.fields = fields
  }

  eq(field: string, value: any): this {
    this.filters.push({ field, operator: '=', value })
    return this
  }

  async execute() {
    let query = `SELECT ${this.fields} FROM ${this.tableName}`
    const values: any[] = []
    let paramCount = 1

    if (this.filters.length > 0) {
      const whereClause = this.filters
        .map(({ field, operator, value }) => {
          values.push(value)
          return `${field} ${operator} $${paramCount++}`
        })
        .join(' AND ')
      query += ` WHERE ${whereClause}`
    }

    query += ` LIMIT 1`

    const result = await this.client.query(query, values)
    return { error: null, data: result.rows[0] || null }
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  [Symbol.toStringTag] = 'Promise'
}

class InsertBuilder {
  private client: Client
  private tableName: string
  private data: any[]

  constructor(client: Client, tableName: string, data: any[]) {
    this.client = client
    this.tableName = tableName
    this.data = data
  }

  async execute() {
    if (this.data.length === 0) {
      return { error: null, data: [] }
    }

    const keys = Object.keys(this.data[0])
    const placeholders = this.data
      .map((_, rowIndex) => {
        const rowPlaceholders = keys
          .map((_, colIndex) => `$${rowIndex * keys.length + colIndex + 1}`)
          .join(', ')
        return `(${rowPlaceholders})`
      })
      .join(', ')

    const values = this.data.flatMap((row) => keys.map((key) => row[key]))
    const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES ${placeholders} RETURNING *`

    const result = await this.client.query(query, values)
    return { error: null, data: result.rows }
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  [Symbol.toStringTag] = 'Promise'
}

class UpdateBuilder {
  private client: Client
  private tableName: string
  private data: Record<string, any>
  private filters: Array<{ field: string; operator: string; value: any }> = []

  constructor(client: Client, tableName: string, data: Record<string, any>) {
    this.client = client
    this.tableName = tableName
    this.data = data
  }

  eq(field: string, value: any): this {
    this.filters.push({ field, operator: '=', value })
    return this
  }

  async execute() {
    const keys = Object.keys(this.data)
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')
    const values = keys.map((key) => this.data[key])

    let query = `UPDATE ${this.tableName} SET ${setClause}`
    let paramCount = values.length + 1

    if (this.filters.length > 0) {
      const whereClause = this.filters
        .map(({ field, operator, value }) => {
          values.push(value)
          return `${field} ${operator} $${paramCount++}`
        })
        .join(' AND ')
      query += ` WHERE ${whereClause}`
    }

    query += ` RETURNING *`

    const result = await this.client.query(query, values)
    return { error: null, data: result.rows }
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  [Symbol.toStringTag] = 'Promise'
}

class DeleteBuilder {
  private client: Client
  private tableName: string
  private filters: Array<{ field: string; operator: string; value: any }> = []

  constructor(client: Client, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  eq(field: string, value: any): this {
    this.filters.push({ field, operator: '=', value })
    return this
  }

  async execute() {
    let query = `DELETE FROM ${this.tableName}`
    const values: any[] = []
    let paramCount = 1

    if (this.filters.length > 0) {
      const whereClause = this.filters
        .map(({ field, operator, value }) => {
          values.push(value)
          return `${field} ${operator} $${paramCount++}`
        })
        .join(' AND ')
      query += ` WHERE ${whereClause}`
    }

    query += ` RETURNING *`

    const result = await this.client.query(query, values)
    return { error: null, data: result.rows }
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  [Symbol.toStringTag] = 'Promise'
}

/**
 * Factory function to create a PostgreSQL client
 */
export function createPostgreSQLClient(connectionString?: string): PostgreSQLClient {
  return new PostgreSQLClient(connectionString)
}

export { PostgreSQLClient }
