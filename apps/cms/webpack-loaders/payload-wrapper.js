// Wrapper module that re-exports payload with missing functions
// This is used to provide missing exports expected by @payloadcms packages

import * as payload from 'payload'
import * as payloadShared from 'payload/shared'

// Stub functions that don't exist in payload 3.69.0
export function genImportMapIterateFields() {
  return []
}

export function getFromImportMap() {
  return undefined
}

// Re-export everything from payload
export * from 'payload'
export * from 'payload/shared'
