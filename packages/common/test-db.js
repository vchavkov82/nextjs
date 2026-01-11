import { getPool } from './src/database.ts'

async function testDatabase() {
  console.log('Testing database connection...')

  try {
    const pool = getPool()

    // Test basic connection
    const result = await pool.query('SELECT version()')
    console.log('✅ Database connected successfully!')
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1])

    // Test our tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('📋 Available tables:', tablesResult.rows.map(row => row.table_name))

    // Test inserting sample data
    console.log('📝 Inserting sample data...')
    await pool.query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `, ['test@example.com', 'dummy_hash'])

    await pool.query(`
      INSERT INTO posts (title, content, author_id)
      VALUES ($1, $2, (SELECT id FROM users WHERE email = $3))
      ON CONFLICT DO NOTHING
    `, ['Welcome Post', 'This is a test post for our local database!', 'test@example.com'])

    console.log('✅ Sample data inserted!')

    // Test querying
    const postsResult = await pool.query(`
      SELECT p.title, p.content, u.email as author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LIMIT 5
    `)

    console.log('📖 Sample posts:')
    postsResult.rows.forEach((post, index) => {
      console.log(`  ${index + 1}. "${post.title}" by ${post.author}`)
    })

    console.log('🎉 Database test completed successfully!')

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    process.exit(1)
  }
}

testDatabase()