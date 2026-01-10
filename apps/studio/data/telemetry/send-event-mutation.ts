/**
 * Telemetry stub - returns a no-op function
 * External telemetry has been removed
 */
export function sendEvent(_event: {
  action: string
  properties?: Record<string, unknown>
  groups?: Record<string, string>
}) {
  // No-op: telemetry has been removed
}
