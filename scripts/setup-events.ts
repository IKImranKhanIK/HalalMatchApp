/**
 * Setup events table and add sample data
 * Run with: npx tsx scripts/setup-events.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔄 Setting up events system...\n');

async function setupEvents() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Create sample events
    console.log('📅 Creating sample events...');

    const events = [
      {
        name: 'December Matchmaking Event',
        date: '2024-12-08',
        location: 'Masjid Al-Noor Community Center',
        description: 'Monthly halal matchmaking event with 42 participants',
        status: 'completed'
      },
      {
        name: 'January Matchmaking Event',
        date: '2025-01-15',
        location: 'Islamic Center Downtown',
        description: 'New year matchmaking gathering',
        status: 'upcoming'
      },
      {
        name: 'February Matchmaking Event',
        date: '2025-02-20',
        location: 'Masjid Al-Rahman',
        description: 'Valentine season special matchmaking event',
        status: 'upcoming'
      }
    ];

    const { data: createdEvents, error: eventsError } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (eventsError) {
      console.error('❌ Error creating events:', eventsError);
      console.log('\n💡 The events table may not exist yet.');
      console.log('   Please run the SQL migration first:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Execute the SQL in: supabase/migrations/add_events_table.sql\n');
      return;
    }

    console.log(`✅ Created ${createdEvents?.length} events\n`);

    // Assign existing participants to the December event
    if (createdEvents && createdEvents.length > 0) {
      const decemberEvent = createdEvents[0];
      console.log(`📝 Assigning existing participants to "${decemberEvent.name}"...`);

      const { data: participants } = await supabase
        .from('participants')
        .select('id')
        .is('event_id', null);

      if (participants && participants.length > 0) {
        const { error: updateError } = await supabase
          .from('participants')
          .update({ event_id: decemberEvent.id })
          .is('event_id', null);

        if (updateError) {
          console.log('⚠️  Could not assign participants:', updateError.message);
        } else {
          console.log(`✅ Assigned ${participants.length} participants to the event\n`);
        }
      }

      // Assign existing selections to the December event
      console.log('📝 Assigning existing selections to the event...');

      const { data: selections } = await supabase
        .from('interest_selections')
        .select('id')
        .is('event_id', null);

      if (selections && selections.length > 0) {
        const { error: selectionsUpdateError } = await supabase
          .from('interest_selections')
          .update({ event_id: decemberEvent.id })
          .is('event_id', null);

        if (selectionsUpdateError) {
          console.log('⚠️  Could not assign selections:', selectionsUpdateError.message);
        } else {
          console.log(`✅ Assigned ${selections.length} selections to the event\n`);
        }
      }
    }

    console.log('✨ Events system setup complete!\n');
    console.log('🎯 You can now:');
    console.log('  - View events at: http://localhost:3000/admin/history');
    console.log('  - Manage events at: http://localhost:3000/admin/events');
    console.log('  - Assign participants to specific events');
    console.log('  - Track selections and matches per event\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupEvents();
