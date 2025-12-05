-- Part 2: Everything else
-- Run this AFTER part 1 succeeds

-- Insert seed data
INSERT INTO events (name, event_date, location, status, max_participants)
VALUES ('Halal Match Event 2025', '2025-12-15', 'Local Mosque', 'upcoming', 100);

INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@halalmatch.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU/hF5/lgn3O',
  'Admin User',
  'admin'
);

SELECT 'Part 2 complete - Data inserted! You can now create .env.local and start building!' AS status;
