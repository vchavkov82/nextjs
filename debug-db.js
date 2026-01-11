const { Client } = require('pg')

async function debugConnection() {
  console.log('Debugging database connection...')

  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'localdb',
    user: 'postgres',
    password: 'password',
    connectionTimeoutMillis: 5000,
  })

  try {
    console.log('Attempting to connect...')
    await client.connect()
    console.log('✅ Connected successfully!')

    const result = await client.query('SELECT version()')
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[1])

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    console.log('Tables:', tables.rows.map(r => r.table_name))

  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error details:', error)
  } finally {
    await client.end()
  }
}

debugConnection()