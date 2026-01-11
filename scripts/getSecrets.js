#!/usr/bin/env node

/**
 * Fetches secrets from AWS Secrets Manager and writes them to .env.local file
 * 
 * Usage: node getSecrets.js -n <secret-name> [-r <region>]
 * 
 * Options:
 *   -n, --secret-name  Name of the secret in AWS Secrets Manager (required)
 *   -r, --region       AWS region (default: ap-southeast-2)
 * 
 * Environment variables:
 *   AWS_ACCESS_KEY_ID     AWS access key (optional if using instance profile)
 *   AWS_SECRET_ACCESS_KEY AWS secret key (optional if using instance profile)
 *   AWS_SESSION_TOKEN     AWS session token (optional if using instance profile)
 */

const fs = require('fs/promises')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { parseArgs } = require('node:util')
const assert = require('assert')

const args = parseArgs({
  options: {
    secretName: { type: 'string', short: 'n' },
    region: { type: 'string', short: 'r' },
  },
})

const secretName = args.values.secretName
const region = args.values.region || 'ap-southeast-2'

// Validate required arguments
if (!secretName) {
  console.error('Error: secretName is required (-n <secret-name>)')
  process.exit(1)
}

// Validate secret name format
if (!/^[a-zA-Z0-9_\/-]+$/.test(secretName)) {
  console.error('Error: Invalid secret name format. Only alphanumeric characters, underscores, hyphens, and forward slashes are allowed.')
  process.exit(1)
}

// Validate region format
if (!/^[a-z0-9-]+$/.test(region)) {
  console.error('Error: Invalid region format')
  process.exit(1)
}

/**
 * Fetches secrets from AWS Secrets Manager
 * @param {string} name - Secret name
 * @param {string} region - AWS region
 * @returns {Promise<Object>} Parsed secret data
 */
const getSecrets = async (name, region) => {
  try {
    console.log(`Fetching secret '${name}' from region '${region}'...`)
    
    const secretsmanager = new SecretsManagerClient({ 
      region,
      // Use retry configuration for better reliability
      maxAttempts: 3,
      retryMode: 'adaptive'
    })

    const command = new GetSecretValueCommand({
      SecretId: name,
    })
    
    const data = await secretsmanager.send(command)

    if (!data.SecretString) {
      throw new Error('SecretString is empty or not found in the response')
    }

    // Try to parse as JSON, fallback to raw string if parsing fails
    let secretData
    try {
      secretData = JSON.parse(data.SecretString)
    } catch (parseError) {
      console.warn('Warning: Secret is not valid JSON, treating as raw string')
      secretData = { value: data.SecretString }
    }

    console.log(`Successfully fetched secret with ${Object.keys(secretData).length} key(s)`)
    return secretData
  } catch (err) {
    console.error('Error fetching secrets from AWS Secrets Manager:')
    
    // Provide more specific error messages
    if (err.name === 'ResourceNotFoundException') {
      console.error(`  Secret '${name}' not found in region '${region}'`)
    } else if (err.name === 'AccessDeniedException') {
      console.error(`  Access denied. Check your AWS credentials and permissions for secret '${name}'`)
    } else if (err.name === 'InvalidRequestException') {
      console.error(`  Invalid request: ${err.message}`)
    } else if (err.name === 'InvalidParameterException') {
      console.error(`  Invalid parameter: ${err.message}`)
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error('  Network error. Check your internet connection and region settings')
    } else {
      console.error(`  ${err.name}: ${err.message}`)
    }
    
    process.exit(1)
  }
}

/**
 * Validates secret key-value pairs
 * @param {Object} secrets - Secret data
 * @returns {boolean} True if all secrets are valid
 */
const validateSecrets = (secrets) => {
  if (!secrets || typeof secrets !== 'object') {
    console.error('Error: Secrets must be a valid object')
    return false
  }

  for (const [key, value] of Object.entries(secrets)) {
    // Validate key format
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
      console.error(`Error: Invalid secret key format '${key}'. Keys should be uppercase with underscores and start with a letter.`)
      return false
    }

    // Validate value
    if (typeof value !== 'string') {
      console.error(`Error: Secret value for '${key}' must be a string`)
      return false
    }

    // Check for empty values
    if (!value.trim()) {
      console.warn(`Warning: Secret value for '${key}' is empty`)
    }
  }

  return true
}

/**
 * Writes secrets to .env.local file
 * @param {Object} secrets - Secret data
 */
const writeEnvFile = async (secrets) => {
  try {
    const envContent = Object.entries(secrets)
      .map(([key, value]) => `${key}="${value.replace(/"/g, '\\"')}"`)
      .join('\n') + '\n'

    await fs.writeFile('.env.local', envContent.trim() + '\n')
    console.log(`Successfully wrote ${Object.keys(secrets).length} secret(s) to .env.local`)
  } catch (err) {
    console.error('Error writing to .env.local file:')
    console.error(`  ${err.message}`)
    process.exit(1)
  }
}

// Main execution
const main = async () => {
  try {
    console.log('Starting secrets fetch process...')
    
    const secrets = await getSecrets(secretName, region)
    
    if (!validateSecrets(secrets)) {
      process.exit(1)
    }

    await writeEnvFile(secrets)
    
    console.log('✅ Secrets fetch completed successfully!')
  } catch (err) {
    console.error('Unexpected error:', err.message)
    process.exit(1)
  }
}

// Execute main function
main()
