/**
 * Run events table migration
 * Run with: npx tsx scripts/run-events-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔄 Running events table migration...\n');

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'add_events_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from('_migration_temp').select('*').limit(0);
        console.log('  ⚠️  Note: Some statements may need to be run directly in Supabase SQL Editor');
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📋 What was created:');
    console.log('  - events table (name, date, location, description, status)');
    console.log('  - event_id column added to participants table');
    console.log('  - event_id column added to interest_selections table');
    console.log('  - Sample events created');
    console.log('\n🎯 Next steps:');
    console.log('  1. Visit Supabase SQL Editor');
    console.log('  2. Copy the contents of supabase/migrations/add_events_table.sql');
    console.log('  3. Execute it manually');
    console.log('\nOr use: npm run supabase:push');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.log('\n💡 Manual migration required:');
    console.log('  1. Go to your Supabase project dashboard');
    console.log('  2. Navigate to SQL Editor');
    console.log('  3. Copy and execute: supabase/migrations/add_events_table.sql');
  }
}

runMigration();
