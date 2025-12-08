/**
 * Create test selections with mutual matches
 * Run with: npx tsx scripts/create-test-selections.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestSelections() {
  console.log('Creating test selections...\n');

  // Participant IDs from registration
  const participants = {
    ahmed: '68959a10-2f90-41d8-8564-230c821a6fd4',      // 101
    fatima: 'e84968be-de4b-469d-aae7-c5c90d8fd18e',     // 102
    omar: '71ed625e-13c8-4d22-8398-8d2b91139d1c',       // 103
    aisha: 'bd1518ac-7996-4443-b3fa-0ca88dd01907',     // 104
    yusuf: '20635ab7-edb4-4844-bef1-2a52d6b671ae',     // 105
    maryam: '82c08645-6bea-4901-addf-1bea299401b9',    // 106
    ibrahim: '9986887b-cb4b-43d3-ad85-9af5f6d4751a',   // 107
    zahra: 'bb193023-d21d-4fa3-b46d-a3b20af88a55',     // 108
    hassan: 'feed77aa-1b52-40aa-a507-d733bc07aba2',    // 109
    safiya: '1f1bd352-15fa-4902-9dbf-f6305bffaf3d',    // 110
  };

  const selections = [
    // Mutual Match #1: Ahmed ↔ Fatima
    { selector_id: participants.ahmed, selected_id: participants.fatima },
    { selector_id: participants.fatima, selected_id: participants.ahmed },

    // Mutual Match #2: Omar ↔ Aisha
    { selector_id: participants.omar, selected_id: participants.aisha },
    { selector_id: participants.aisha, selected_id: participants.omar },

    // Mutual Match #3: Ibrahim ↔ Zahra
    { selector_id: participants.ibrahim, selected_id: participants.zahra },
    { selector_id: participants.zahra, selected_id: participants.ibrahim },

    // One-Way: Yusuf → Maryam
    { selector_id: participants.yusuf, selected_id: participants.maryam },

    // One-Way: Hassan → Safiya
    { selector_id: participants.hassan, selected_id: participants.safiya },

    // One-Way: Maryam → Omar
    { selector_id: participants.maryam, selected_id: participants.omar },

    // One-Way: Safiya → Ibrahim
    { selector_id: participants.safiya, selected_id: participants.ibrahim },
  ];

  const { data, error } = await supabase
    .from('interest_selections')
    .insert(selections)
    .select();

  if (error) {
    console.error('❌ Error creating selections:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully created ${data.length} selections!\n`);
  console.log('📊 Summary:');
  console.log('  • 3 Mutual Matches:');
  console.log('    - Ahmed (101) ↔ Fatima (102)');
  console.log('    - Omar (103) ↔ Aisha (104)');
  console.log('    - Ibrahim (107) ↔ Zahra (108)');
  console.log('\n  • 4 One-Way Selections:');
  console.log('    - Yusuf (105) → Maryam (106)');
  console.log('    - Hassan (109) → Safiya (110)');
  console.log('    - Maryam (106) → Omar (103)');
  console.log('    - Safiya (110) → Ibrahim (107)');
  console.log('\n✨ Go to http://localhost:3000/admin/dashboard to export!');
}

createTestSelections();
