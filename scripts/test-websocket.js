#!/usr/bin/env node

/**
 * WebSocket Connection Test Script
 * Tests WebSocket connections to verify fixes work
 */

const { testWebSocketConnection } = require('../packages/common/src/websocket.ts')

async function main() {
  console.log('Testing WebSocket connections...\n')

  // Test with localhost Supabase instance
  const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

  console.log(`Testing connection to: ${supabaseUrl}`)
  console.log(`Using key: ${supabaseKey.substring(0, 20)}...`)

  try {
    const result = await testWebSocketConnection(supabaseUrl, supabaseKey)

    if (result.success) {
      console.log('✅ WebSocket connection successful!')
      console.log(`📊 Latency: ${result.latency}ms`)

      if (result.latency < 100) {
        console.log('🚀 Excellent connection')
      } else if (result.latency < 500) {
        console.log('👍 Good connection')
      } else {
        console.log('⚠️  Slow connection - consider optimizing')
      }
    } else {
      console.error('❌ WebSocket connection failed!')
      console.error(`Error: ${result.error}`)

      console.log('\n🔧 Troubleshooting suggestions:')
      console.log('1. Check if Supabase is running: supabase status')
      console.log('2. Verify Node.js version: node --version (should be v22+)')
      console.log('3. Check network connectivity')
      console.log('4. Review firewall/proxy settings')
    }
  } catch (error) {
    console.error('💥 Test failed with error:', error.message)
  }

  console.log('\n📋 Additional checks:')

  // Check Node.js version
  const nodeVersion = process.version
  console.log(`Node.js version: ${nodeVersion}`)
  if (nodeVersion.startsWith('v22') || nodeVersion.startsWith('v24')) {
    console.log('✅ Compatible Node.js version')
  } else {
    console.log('⚠️  Node.js version may cause issues. Recommended: v22+')
  }

  // Check if Supabase CLI is available
  try {
    const { execSync } = require('child_process')
    execSync('supabase --version', { stdio: 'pipe' })
    console.log('✅ Supabase CLI available')
  } catch {
    console.log('⚠️  Supabase CLI not found in PATH')
  }

  console.log('\n🎯 For Edge Functions WebSocket testing:')
  console.log('1. Ensure edge_runtime policy is set to "per_worker" in config.toml')
  console.log('2. Run: supabase functions serve')
  console.log('3. Test with: websocat "ws://localhost:54321/functions/v1/your-function"')
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }