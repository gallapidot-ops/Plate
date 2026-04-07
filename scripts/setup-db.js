/**
 * Plate – Database setup script
 * Usage: node scripts/setup-db.js <DATABASE_URL>
 *
 * Get your DATABASE_URL from:
 *   Supabase Dashboard → Settings → Database → Connection string (URI)
 *   Format: postgresql://postgres:[password]@db.snmvjkncnaqlfiohmqme.supabase.co:5432/postgres
 *
 * Or run the SQL manually:
 *   Supabase Dashboard → SQL Editor → paste supabase/migrations/001_initial_schema.sql
 */

const { execSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

const dbUrl = process.argv[2]

if (!dbUrl) {
  console.log('\n⚠️  No DATABASE_URL provided.\n')
  console.log('Option A – Run manually in Supabase Dashboard:')
  console.log('  1. Go to https://supabase.com/dashboard/project/snmvjkncnaqlfiohmqme/sql/new')
  console.log('  2. Paste the contents of: supabase/migrations/001_initial_schema.sql')
  console.log('  3. Click "Run"\n')
  console.log('Option B – Run this script with your DB password:')
  console.log('  node scripts/setup-db.js "postgresql://postgres:<password>@db.snmvjkncnaqlfiohmqme.supabase.co:5432/postgres"\n')
  process.exit(0)
}

const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/001_initial_schema.sql'), 'utf8')
const tmp = path.join(require('os').tmpdir(), 'plate_migration.sql')
fs.writeFileSync(tmp, sql)

try {
  console.log('🚀 Running migration...')
  execSync(`psql "${dbUrl}" -f "${tmp}"`, { stdio: 'inherit' })
  console.log('✅ Migration complete! Tables created in Supabase.')
} catch (e) {
  console.error('❌ Migration failed. Make sure `psql` is installed and the DATABASE_URL is correct.')
  process.exit(1)
} finally {
  fs.unlinkSync(tmp)
}
