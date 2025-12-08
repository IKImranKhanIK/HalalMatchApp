/**
 * Create pending participants for testing bulk approval
 * Run with: npx tsx scripts/create-pending-participants.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 Creating Pending Participants for Bulk Approval Testing...\n');

// Create 20 pending participants for testing
const pendingParticipants = [
  // Males
  { participant_number: 301, full_name: 'Ahmed Hassan', email: 'ahmed.hassan@test.com', phone: '(555) 301-0001', gender: 'male', age: 28, occupation: 'engineering' },
  { participant_number: 302, full_name: 'Muhammad Ali', email: 'muhammad.ali@test.com', phone: '(555) 302-0002', gender: 'male', age: 32, occupation: 'technology' },
  { participant_number: 303, full_name: 'Omar Ibrahim', email: 'omar.ibrahim@test.com', phone: '(555) 303-0003', gender: 'male', age: 26, occupation: 'finance' },
  { participant_number: 304, full_name: 'Khalid Ahmad', email: 'khalid.ahmad@test.com', phone: '(555) 304-0004', gender: 'male', age: 30, occupation: 'healthcare' },
  { participant_number: 305, full_name: 'Yusuf Malik', email: 'yusuf.malik@test.com', phone: '(555) 305-0005', gender: 'male', age: 27, occupation: 'education' },
  { participant_number: 306, full_name: 'Ibrahim Saleh', email: 'ibrahim.saleh@test.com', phone: '(555) 306-0006', gender: 'male', age: 33, occupation: 'business' },
  { participant_number: 307, full_name: 'Hassan Mahmoud', email: 'hassan.mahmoud@test.com', phone: '(555) 307-0007', gender: 'male', age: 29, occupation: 'technology' },
  { participant_number: 308, full_name: 'Tariq Nasser', email: 'tariq.nasser@test.com', phone: '(555) 308-0008', gender: 'male', age: 31, occupation: 'legal' },
  { participant_number: 309, full_name: 'Bilal Rashid', email: 'bilal.rashid@test.com', phone: '(555) 309-0009', gender: 'male', age: 25, occupation: 'engineering' },
  { participant_number: 310, full_name: 'Hamza Karim', email: 'hamza.karim@test.com', phone: '(555) 310-0010', gender: 'male', age: 34, occupation: 'healthcare' },

  // Females
  { participant_number: 311, full_name: 'Fatima Zahra', email: 'fatima.zahra@test.com', phone: '(555) 311-0011', gender: 'female', age: 26, occupation: 'healthcare' },
  { participant_number: 312, full_name: 'Aisha Rahman', email: 'aisha.rahman@test.com', phone: '(555) 312-0012', gender: 'female', age: 28, occupation: 'education' },
  { participant_number: 313, full_name: 'Mariam Farooq', email: 'mariam.farooq@test.com', phone: '(555) 313-0013', gender: 'female', age: 24, occupation: 'technology' },
  { participant_number: 314, full_name: 'Layla Hussain', email: 'layla.hussain@test.com', phone: '(555) 314-0014', gender: 'female', age: 30, occupation: 'marketing' },
  { participant_number: 315, full_name: 'Nour Abdullah', email: 'nour.abdullah@test.com', phone: '(555) 315-0015', gender: 'female', age: 27, occupation: 'finance' },
  { participant_number: 316, full_name: 'Sara Khalil', email: 'sara.khalil@test.com', phone: '(555) 316-0016', gender: 'female', age: 29, occupation: 'healthcare' },
  { participant_number: 317, full_name: 'Amina Said', email: 'amina.said2@test.com', phone: '(555) 317-0017', gender: 'female', age: 25, occupation: 'education' },
  { participant_number: 318, full_name: 'Huda Youssef', email: 'huda.youssef2@test.com', phone: '(555) 318-0018', gender: 'female', age: 31, occupation: 'legal' },
  { participant_number: 319, full_name: 'Zahra Mansour', email: 'zahra.mansour@test.com', phone: '(555) 319-0019', gender: 'female', age: 28, occupation: 'business' },
  { participant_number: 320, full_name: 'Safiya Ahmad', email: 'safiya.ahmad@test.com', phone: '(555) 320-0020', gender: 'female', age: 32, occupation: 'technology' },
];

async function createPendingParticipants() {
  console.log('📝 Creating 20 pending participants...\n');

  // Clear existing test participants (300-399)
  console.log('  🧹 Clearing existing test participants (300-399)...');
  await supabase
    .from('participants')
    .delete()
    .gte('participant_number', 300)
    .lt('participant_number', 400);

  // Insert pending participants (default status is 'pending')
  const { data: participants, error: insertError } = await supabase
    .from('participants')
    .insert(pendingParticipants)
    .select();

  if (insertError) {
    console.error('  ❌ Error creating participants:', insertError);
    process.exit(1);
  }

  console.log(`  ✅ Created ${participants.length} pending participants`);
  console.log(`     - 10 males (ages 25-34)`);
  console.log(`     - 10 females (ages 24-32)`);
  console.log(`     - Various occupations\n`);

  console.log('✨ Pending participants created!\n');
  console.log('🎯 Now you can test bulk approval:');
  console.log('  1. Visit: http://localhost:3000/admin/participants');
  console.log('  2. Click "✓ Approve All Pending" button (top right)');
  console.log('  3. Or use "Select All Pending" then "Bulk Approve"');
  console.log('  4. Watch 20 participants get approved instantly!\n');
}

createPendingParticipants().catch(console.error);
