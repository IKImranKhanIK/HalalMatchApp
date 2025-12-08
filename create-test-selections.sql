-- Create Test Selections with Mutual Matches
-- Run this in Supabase SQL Editor

-- Mutual Match #1: Ahmed (101) ↔ Fatima (102)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('68959a10-2f90-41d8-8564-230c821a6fd4', 'e84968be-de4b-469d-aae7-c5c90d8fd18e'),
('e84968be-de4b-469d-aae7-c5c90d8fd18e', '68959a10-2f90-41d8-8564-230c821a6fd4');

-- Mutual Match #2: Omar (103) ↔ Aisha (104)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('71ed625e-13c8-4d22-8398-8d2b91139d1c', 'bd1518ac-7996-4443-b3fa-0ca88dd01907'),
('bd1518ac-7996-4443-b3fa-0ca88dd01907', '71ed625e-13c8-4d22-8398-8d2b91139d1c');

-- Mutual Match #3: Ibrahim (107) ↔ Zahra (108)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('9986887b-cb4b-43d3-ad85-9af5f6d4751a', 'bb193023-d21d-4fa3-b46d-a3b20af88a55'),
('bb193023-d21d-4fa3-b46d-a3b20af88a55', '9986887b-cb4b-43d3-ad85-9af5f6d4751a');

-- One-Way Selection #1: Yusuf (105) → Maryam (106)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('20635ab7-edb4-4844-bef1-2a52d6b671ae', '82c08645-6bea-4901-addf-1bea299401b9');

-- One-Way Selection #2: Hassan (109) → Safiya (110)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('feed77aa-1b52-40aa-a507-d733bc07aba2', '1f1bd352-15fa-4902-9dbf-f6305bffaf3d');

-- One-Way Selection #3: Maryam (106) → Omar (103)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('82c08645-6bea-4901-addf-1bea299401b9', '71ed625e-13c8-4d22-8398-8d2b91139d1c');

-- One-Way Selection #4: Safiya (110) → Ibrahim (107)
INSERT INTO interest_selections (selector_id, selected_id) VALUES
('1f1bd352-15fa-4902-9dbf-f6305bffaf3d', '9986887b-cb4b-43d3-ad85-9af5f6d4751a');

-- Verify the selections were created
SELECT COUNT(*) as total_selections FROM interest_selections;
