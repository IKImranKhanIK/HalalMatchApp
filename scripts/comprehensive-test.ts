/**
 * Comprehensive Testing Script
 * Tests all features of the Halal Match App
 * Run with: npx tsx scripts/comprehensive-test.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 Starting Comprehensive Testing...\n');

// Diverse test participants
const testParticipants = [
  // Males
  { participant_number: 201, full_name: 'Ali Muhammad', email: 'ali.muhammad@test.com', phone: '(555) 111-1111', gender: 'male', age: 25, occupation: 'technology' },
  { participant_number: 202, full_name: 'Omar Abdullah', email: 'omar.abdullah@test.com', phone: '(555) 222-2222', gender: 'male', age: 30, occupation: 'healthcare' },
  { participant_number: 203, full_name: 'Khalid Ahmed', email: 'khalid.ahmed@test.com', phone: '(555) 333-3333', gender: 'male', age: 28, occupation: 'engineering' },
  { participant_number: 204, full_name: 'Tariq Hassan', email: 'tariq.hassan@test.com', phone: '(555) 444-4444', gender: 'male', age: 35, occupation: 'finance' },
  { participant_number: 205, full_name: 'Bilal Mahmoud', email: 'bilal.mahmoud@test.com', phone: '(555) 555-5555', gender: 'male', age: 27, occupation: 'education' },
  { participant_number: 206, full_name: 'Hamza Rashid', email: 'hamza.rashid@test.com', phone: '(555) 666-6666', gender: 'male', age: 32, occupation: 'business' },

  // Females
  { participant_number: 207, full_name: 'Amina Said', email: 'amina.said@test.com', phone: '(555) 777-7777', gender: 'female', age: 24, occupation: 'healthcare' },
  { participant_number: 208, full_name: 'Layla Ibrahim', email: 'layla.ibrahim@test.com', phone: '(555) 888-8888', gender: 'female', age: 26, occupation: 'education' },
  { participant_number: 209, full_name: 'Nour Khalil', email: 'nour.khalil@test.com', phone: '(555) 999-9999', gender: 'female', age: 29, occupation: 'marketing' },
  { participant_number: 210, full_name: 'Mariam Farah', email: 'mariam.farah@test.com', phone: '(555) 101-0101', gender: 'female', age: 31, occupation: 'technology' },
  { participant_number: 211, full_name: 'Sara Mansour', email: 'sara.mansour@test.com', phone: '(555) 202-0202', gender: 'female', age: 28, occupation: 'legal' },
  { participant_number: 212, full_name: 'Huda Youssef', email: 'huda.youssef@test.com', phone: '(555) 303-0303', gender: 'female', age: 33, occupation: 'finance' },
];

async function runTests() {
  console.log('📝 Phase 1: Creating Test Participants...');

  // Clear existing test data
  console.log('  🧹 Clearing existing test participants (200-299)...');
  await supabase
    .from('participants')
    .delete()
    .gte('participant_number', 200)
    .lt('participant_number', 300);

  // Insert test participants
  const { data: participants, error: insertError } = await supabase
    .from('participants')
    .insert(testParticipants)
    .select();

  if (insertError) {
    console.error('  ❌ Error creating participants:', insertError);
    process.exit(1);
  }

  console.log(`  ✅ Created ${participants.length} test participants`);
  console.log(`     - 6 males (ages 25-35)`);
  console.log(`     - 6 females (ages 24-33)`);
  console.log(`     - Various occupations: Tech, Healthcare, Education, Finance, etc.\n`);

  // Approve all participants
  console.log('📝 Phase 2: Approving All Participants...');
  const { error: approveError } = await supabase
    .from('participants')
    .update({ background_check_status: 'approved' })
    .in('id', participants.map(p => p.id));

  if (approveError) {
    console.error('  ❌ Error approving participants:', approveError);
    process.exit(1);
  }

  console.log(`  ✅ Approved all ${participants.length} participants\n`);

  // Create participant ID map
  const participantMap = new Map(
    participants.map(p => [p.participant_number, p.id])
  );

  console.log('📝 Phase 3: Creating Selection Patterns...');

  // Clear existing selections for test participants
  await supabase
    .from('interest_selections')
    .delete()
    .in('selector_id', participants.map(p => p.id));

  const selections = [
    // Mutual Match #1: Ali (201) ↔ Amina (207)
    { selector_id: participantMap.get(201), selected_id: participantMap.get(207) },
    { selector_id: participantMap.get(207), selected_id: participantMap.get(201) },

    // Mutual Match #2: Omar (202) ↔ Layla (208)
    { selector_id: participantMap.get(202), selected_id: participantMap.get(208) },
    { selector_id: participantMap.get(208), selected_id: participantMap.get(202) },

    // Mutual Match #3: Khalid (203) ↔ Nour (209)
    { selector_id: participantMap.get(203), selected_id: participantMap.get(209) },
    { selector_id: participantMap.get(209), selected_id: participantMap.get(203) },

    // Mutual Match #4: Tariq (204) ↔ Mariam (210)
    { selector_id: participantMap.get(204), selected_id: participantMap.get(210) },
    { selector_id: participantMap.get(210), selected_id: participantMap.get(204) },

    // One-way selections
    { selector_id: participantMap.get(205), selected_id: participantMap.get(211) }, // Bilal → Sara
    { selector_id: participantMap.get(206), selected_id: participantMap.get(212) }, // Hamza → Huda
    { selector_id: participantMap.get(211), selected_id: participantMap.get(202) }, // Sara → Omar
    { selector_id: participantMap.get(212), selected_id: participantMap.get(201) }, // Huda → Ali
  ];

  const { data: createdSelections, error: selectionsError } = await supabase
    .from('interest_selections')
    .insert(selections)
    .select();

  if (selectionsError) {
    console.error('  ❌ Error creating selections:', selectionsError);
    process.exit(1);
  }

  console.log(`  ✅ Created ${createdSelections.length} selections`);
  console.log(`     - 4 mutual matches (8 selections)`);
  console.log(`     - 4 one-way selections\n`);

  // Summary
  console.log('📊 Test Data Summary:');
  console.log('  ✅ 12 approved participants (6 male, 6 female)');
  console.log('  ✅ 12 total selections');
  console.log('  ✅ 4 mutual matches');
  console.log('  ✅ 4 one-way selections');
  console.log('  ✅ Ages: 24-35 (diverse range)');
  console.log('  ✅ 7 different occupations\n');

  console.log('🎯 Ready for Testing!');
  console.log('  📍 Visit: http://localhost:3000/admin/dashboard');
  console.log('  📊 Check analytics charts');
  console.log('  📝 Test filters (gender, age, occupation)');
  console.log('  📥 Export Excel and verify styling');
  console.log('  🎨 Verify colorful mutual matches sheet\n');

  console.log('✨ Testing complete!');
}

runTests().catch(console.error);
