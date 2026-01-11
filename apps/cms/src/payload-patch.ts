// Patch for missing payload exports
// This file patches the payload module to include missing exports that webpack can't resolve statically

import * as payload from 'payload'
import * as payloadShared from 'payload/dist/exports/shared.js'

// Patch the main payload export to include genImportMapIterateFields
if (!('genImportMapIterateFields' in payload)) {
  (payload as any).genImportMapIterateFields = payloadShared.genImportMapIterateFields
}

// Patch the payload/shared export to include getFromImportMap
if (!('getFromImportMap' in payloadShared)) {
  (payloadShared as any).getFromImportMap = payloadShared.getFromImportMap
}

console.log('Payload patched successfully')