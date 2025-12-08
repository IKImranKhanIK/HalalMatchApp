-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add event_id to participants table
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- Add event_id to interest_selections table
ALTER TABLE interest_selections
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_selections_event_id ON interest_selections(event_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations on events" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert a sample event for testing
INSERT INTO events (name, date, location, description, status)
VALUES
  ('December Matchmaking Event', '2024-12-08', 'Masjid Al-Noor Community Center', 'Monthly halal matchmaking event', 'completed'),
  ('January Matchmaking Event', '2025-01-15', 'Islamic Center Downtown', 'New year matchmaking gathering', 'upcoming');

COMMENT ON TABLE events IS 'Stores matchmaking events with dates and locations';
COMMENT ON COLUMN events.name IS 'Name of the event';
COMMENT ON COLUMN events.date IS 'Date when the event takes place';
COMMENT ON COLUMN events.location IS 'Mosque or community center location';
COMMENT ON COLUMN events.status IS 'Current status of the event';
