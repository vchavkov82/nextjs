// Stub module for missing payload exports
// These functions are expected by @payloadcms/richtext-lexical and @payloadcms/ui
// but don't exist in payload 3.69.0
// This module only exports the missing functions - payload itself is still imported normally

export function genImportMapIterateFields() {
  return []
}

export function getFromImportMap() {
  return undefined
}
