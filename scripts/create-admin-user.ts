/**
 * Script to create an admin user in Supabase
 * Run with: npx tsx scripts/create-admin-user.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Configuration - Change these to your desired credentials
const ADMIN_EMAIL = 'admin@halalmatch.com';
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password
const ADMIN_NAME = 'Admin';
const ADMIN_ROLE = 'admin';

async function createAdminUser() {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing required environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🔐 Creating admin user...\n');

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Hash the password
    console.log('⏳ Hashing password...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('✅ Password hashed successfully');

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingAdmin) {
      console.log(`\n⚠️  Admin user with email "${ADMIN_EMAIL}" already exists.`);
      console.log('   Updating password...\n');

      // Update existing admin user
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          name: ADMIN_NAME,
          role: ADMIN_ROLE,
          updated_at: new Date().toISOString(),
        })
        .eq('email', ADMIN_EMAIL);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Admin user updated successfully!\n');
    } else {
      // Create new admin user
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: ADMIN_EMAIL,
          password_hash: passwordHash,
          name: ADMIN_NAME,
          role: ADMIN_ROLE,
        });

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Admin user created successfully!\n');
    }

    console.log('📋 Login credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🌐 You can now log in at: https://your-app.vercel.app/admin/login');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
