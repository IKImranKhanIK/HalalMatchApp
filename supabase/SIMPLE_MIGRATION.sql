-- ============================================================================
-- HALAL MATCH - SIMPLIFIED MIGRATION
-- Copy and paste this entire file into Supabase SQL Editor and run
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLEANUP
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view approved participants" ON participants;
DROP POLICY IF EXISTS "Anyone can register as participant" ON participants;
DROP POLICY IF EXISTS "Participants can view their selections" ON interest_selections;
DROP POLICY IF EXISTS "Participants can create selections" ON interest_selections;
DROP POLICY IF EXISTS "Participants can delete their selections" ON interest_selections;
DROP POLICY IF EXISTS "Anyone can view active events" ON events;

DROP VIEW IF EXISTS mutual_matches CASCADE;

DROP FUNCTION IF EXISTS get_participant_selections(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_selection_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS assign_participant_number() CASCADE;

DROP SEQUENCE IF EXISTS participant_number_seq CASCADE;

DROP TABLE IF EXISTS interest_selections CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_number INTEGER UNIQUE NOT NULL DEFAULT 1000,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  background_check_status VARCHAR(20) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
  qr_code_data TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_email_per_event UNIQUE (email, event_id)
);

CREATE TABLE interest_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  selector_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  selected_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_selection UNIQUE (selector_id, selected_id),
  CONSTRAINT no_self_selection CHECK (selector_id != selected_id)
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_participants_number ON participants(participant_number);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_status ON participants(background_check_status);
CREATE INDEX idx_participants_event ON participants(event_id);
CREATE INDEX idx_participants_gender ON participants(gender);
CREATE INDEX idx_selections_selector ON interest_selections(selector_id);
CREATE INDEX idx_selections_selected ON interest_selections(selected_id);
CREATE INDEX idx_selections_created_at ON interest_selections(created_at);
CREATE INDEX idx_selections_pair ON interest_selections(selector_id, selected_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- CREATE SEQUENCE AND FUNCTIONS
-- ============================================================================

CREATE SEQUENCE participant_number_seq START 1000;

CREATE OR REPLACE FUNCTION assign_participant_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.participant_number IS NULL OR NEW.participant_number = 1000 THEN
    NEW.participant_number := nextval('participant_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_selection_stats()
RETURNS TABLE (
  total_selections BIGINT,
  mutual_matches_count BIGINT,
  male_participants BIGINT,
  female_participants BIGINT,
  approved_participants BIGINT,
  pending_checks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM interest_selections),
    (SELECT COUNT(*) FROM (
      SELECT s1.selector_id
      FROM interest_selections s1
      INNER JOIN interest_selections s2 ON s1.selector_id = s2.selected_id AND s1.selected_id = s2.selector_id
      WHERE s1.selector_id < s1.selected_id
    ) AS matches),
    (SELECT COUNT(*) FROM participants WHERE gender = 'male'),
    (SELECT COUNT(*) FROM participants WHERE gender = 'female'),
    (SELECT COUNT(*) FROM participants WHERE background_check_status = 'approved'),
    (SELECT COUNT(*) FROM participants WHERE background_check_status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_participant_selections(participant_uuid UUID)
RETURNS TABLE (
  selection_id UUID,
  selected_participant_id UUID,
  selected_participant_number INTEGER,
  selected_participant_name VARCHAR,
  selected_participant_gender VARCHAR,
  selected_at TIMESTAMP WITH TIME ZONE,
  is_mutual_match BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.selected_id,
    p.participant_number,
    p.full_name,
    p.gender,
    s.created_at,
    EXISTS(
      SELECT 1 FROM interest_selections s2
      WHERE s2.selector_id = s.selected_id AND s2.selected_id = s.selector_id
    )
  FROM interest_selections s
  INNER JOIN participants p ON s.selected_id = p.id
  WHERE s.selector_id = participant_uuid
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER set_participant_number
  BEFORE INSERT ON participants
  FOR EACH ROW
  EXECUTE FUNCTION assign_participant_number();

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CREATE VIEW
-- ============================================================================

CREATE VIEW mutual_matches AS
SELECT
  s1.selector_id AS participant_1_id,
  s1.selected_id AS participant_2_id,
  p1.participant_number AS participant_1_number,
  p1.full_name AS participant_1_name,
  p1.email AS participant_1_email,
  p1.phone AS participant_1_phone,
  p1.gender AS participant_1_gender,
  p2.participant_number AS participant_2_number,
  p2.full_name AS participant_2_name,
  p2.email AS participant_2_email,
  p2.phone AS participant_2_phone,
  p2.gender AS participant_2_gender,
  s1.created_at AS first_selection_at,
  s2.created_at AS second_selection_at,
  GREATEST(s1.created_at, s2.created_at) AS match_completed_at
FROM interest_selections s1
INNER JOIN interest_selections s2 ON s1.selector_id = s2.selected_id AND s1.selected_id = s2.selector_id
INNER JOIN participants p1 ON s1.selector_id = p1.id
INNER JOIN participants p2 ON s1.selected_id = p2.id
WHERE s1.selector_id < s1.selected_id;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved participants"
  ON participants FOR SELECT
  USING (background_check_status = 'approved');

CREATE POLICY "Anyone can register as participant"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can view their selections"
  ON interest_selections FOR SELECT
  USING (selector_id::text = current_setting('app.current_participant_id', true));

CREATE POLICY "Participants can create selections"
  ON interest_selections FOR INSERT
  WITH CHECK (selector_id::text = current_setting('app.current_participant_id', true));

CREATE POLICY "Participants can delete their selections"
  ON interest_selections FOR DELETE
  USING (selector_id::text = current_setting('app.current_participant_id', true));

CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  USING (status IN ('upcoming', 'active'));

-- ============================================================================
-- INSERT SEED DATA
-- ============================================================================

INSERT INTO events (name, event_date, location, status, max_participants)
VALUES ('Halal Match Event 2025', '2025-12-15', 'Local Mosque', 'upcoming', 100);

INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@halalmatch.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU/hF5/lgn3O',
  'Admin User',
  'admin'
);

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Migration completed successfully! Admin login: admin@halalmatch.com / admin123' AS message;
