import { PG_META_URL } from 'lib/constants/index'
import { constructHeaders } from '../apiHelpers'
import { PgMetaDatabaseError, databaseErrorSchema, WrappedResult } from './types'
import { assertSelfHosted, encryptString, getConnectionString } from './util'

export type QueryOptions = {
  query: string
  parameters?: unknown[]
  readOnly?: boolean
  headers?: HeadersInit
}

/**
 * Executes a SQL query against the self-hosted Postgres instance via pg-meta service.
 *
 * _Only call this from server-side self-hosted code._
 */
export async function executeQuery<T = unknown>({
  query,
  parameters,
  readOnly = false,
  headers,
}: QueryOptions): Promise<WrappedResult<T[]>> {
  assertSelfHosted()

  const connectionString = getConnectionString({ readOnly })
  const connectionStringEncrypted = encryptString(connectionString)

  const requestBody: { query: string; parameters?: unknown[] } = { query }
  if (parameters !== undefined) {
    requestBody.parameters = parameters
  }

  const response = await fetch(`${PG_META_URL}/query`, {
    method: 'POST',
    headers: constructHeaders({
      ...headers,
      'Content-Type': 'application/json',
      'x-connection-encrypted': connectionStringEncrypted,
    }),
    body: JSON.stringify(requestBody),
  })

  try {
    const result = await response.json()

    if (!response.ok) {
      try {
        const { message, code, formattedError } = databaseErrorSchema.parse(result)
        const error = new PgMetaDatabaseError(message, code, response.status, formattedError)
        return { data: undefined, error }
      } catch (parseError) {
        // If the error response doesn't match the expected schema, create a generic error
        const fallbackMessage = result?.message || result?.error || 'Unknown database error'
        const fallbackCode = result?.code || response.status.toString()
        const fallbackFormattedError = result?.formattedError || fallbackMessage
        const error = new PgMetaDatabaseError(fallbackMessage, fallbackCode, response.status, fallbackFormattedError)
        return { data: undefined, error }
      }
    }

    return { data: result, error: undefined }
  } catch (error) {
    if (error instanceof Error) {
      return { data: undefined, error }
    }
    throw error
  }
}
