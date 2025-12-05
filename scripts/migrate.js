/**
 * Database Migration Script
 * Run with: node scripts/migrate.js
 *
 * This script connects to your Supabase database and runs migrations
 * in the correct order, with proper error handling.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n=== STEP ${step}: ${message} ===`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Check environment variables
function checkEnvVars() {
  logStep(0, 'Checking environment variables');

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logError(`Missing environment variables: ${missing.join(', ')}`);
    logWarning('Please create .env.local file with your Supabase credentials');
    process.exit(1);
  }

  logSuccess('Environment variables found');
}

// Create Supabase client with service role key
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Execute SQL query
async function executeSql(supabase, sql, description) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // If exec_sql doesn't exist, we need to use raw query
      throw new Error('Using direct query execution');
    }

    return { data, error: null };
  } catch (err) {
    // Fallback to direct execution via REST API
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: sql })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

// Main migration function
async function runMigration() {
  log('\n🚀 Starting Database Migration\n', 'blue');

  checkEnvVars();

  const supabase = createSupabaseClient();

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'SIMPLE_MIGRATION.sql');

  if (!fs.existsSync(migrationPath)) {
    logError('Migration file not found: supabase/SIMPLE_MIGRATION.sql');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  logStep(1, 'Executing migration');
  log('This may take 30-60 seconds...\n');

  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.trim().startsWith('--')) continue;

    // Show progress every 10 statements
    if (i % 10 === 0) {
      process.stdout.write(`\rProgress: ${i}/${statements.length} statements executed...`);
    }

    const { data, error } = await executeSql(supabase, statement, `Statement ${i + 1}`);

    if (error) {
      errorCount++;
      logError(`\nError in statement ${i + 1}:`);
      console.log(statement.substring(0, 100) + '...');
      console.log('Error:', error);

      // Continue with other statements
    } else {
      successCount++;
    }
  }

  console.log('\n');
  logStep(2, 'Verification');

  // Verify tables were created
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['events', 'participants', 'interest_selections', 'admin_users']);

  if (tables && tables.length === 4) {
    logSuccess('All 4 tables created');
  } else {
    logWarning(`Expected 4 tables, found ${tables?.length || 0}`);
  }

  // Verify admin user
  const { data: admins, error: adminsError } = await supabase
    .from('admin_users')
    .select('email')
    .limit(1);

  if (admins && admins.length > 0) {
    logSuccess(`Admin user created: ${admins[0].email}`);
  } else {
    logWarning('Admin user not found');
  }

  log('\n' + '='.repeat(50), 'blue');

  if (errorCount === 0) {
    log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!', 'green');
    log('\nAdmin Credentials:', 'cyan');
    log('  Email: admin@halalmatch.com');
    log('  Password: admin123');
    log('\n⚠️  Change the admin password in production!\n');
  } else {
    logWarning(`\nMigration completed with ${errorCount} errors`);
    logWarning('Check the errors above and run the script again if needed\n');
  }
}

// Run migration
runMigration().catch(error => {
  logError('\nFatal error during migration:');
  console.error(error);
  process.exit(1);
});
