-- ====================================================================
-- RIWA Migration: Enable 'other' category in complaints & incidents
-- Execute this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/btofmtphkyessfypzzqx/sql
-- ====================================================================

-- 1. Update complaints category check constraint
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_category_check;
ALTER TABLE complaints ADD CONSTRAINT complaints_category_check 
  CHECK (category IN ('drainage', 'garbage', 'road_damage', 'electrical_hazard', 'other'));

-- 2. Update incidents category check constraint
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_category_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_category_check 
  CHECK (category IN ('drainage', 'garbage', 'road_damage', 'electrical_hazard', 'other'));

-- 3. Ensure 'Other Civic Services' department exists
INSERT INTO departments (name, code, description)
VALUES (
  'Other Civic Services',
  'other_civic_services',
  'General civic issues, traffic congestion, hospital cleanliness, stray animals, and miscellaneous infrastructure'
)
ON CONFLICT (code) DO NOTHING;
