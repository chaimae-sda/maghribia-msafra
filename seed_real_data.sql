-- ================================================
-- SEED REAL DATA FOR AGENCIES & ADMIN
-- ================================================

-- 1. Create realistic agencies if they don't exist
-- Note: In a real app, these should have Auth IDs. 
-- For seeding purpose, we assume we have some.

-- 2. Seed some Trips for "Atlas Voyages" (Example)
-- Assuming agency_id is known or we can just use the current user's ID for testing.

-- 3. Seed some Bookings for these trips from different travelers
-- This will populate the KPIs.

-- 4. Seed some platform payments
-- This will populate the Admin Earnings.

-- 5. Example SQL to run in Supabase Console:
/*
-- Get a traveler ID and an agency ID
DO $$
DECLARE
    agency1_id UUID;
    traveler1_id UUID;
    trip1_id UUID;
BEGIN
    SELECT id INTO agency1_id FROM profiles WHERE role = 'agency' LIMIT 1;
    SELECT id INTO traveler1_id FROM profiles WHERE role = 'traveler' LIMIT 1;

    IF agency1_id IS NOT NULL AND traveler1_id IS NOT NULL THEN
        -- Create a trip
        INSERT INTO trips (agency_id, title, destination, date, price, max_participants, image_url)
        VALUES (agency1_id, 'Weekend Volubilis & Moulay Idriss', 'Meknès', '2026-05-15', 1200.00, 12, 'https://images.unsplash.com/photo-1590050752117-23a4d70ee51d?w=800')
        RETURNING id INTO trip1_id;

        -- Create bookings
        INSERT INTO bookings (user_id, trip_id, status)
        VALUES (traveler1_id, trip1_id, 'confirmed');

        -- Create platform payment
        INSERT INTO agency_platform_payments (agency_id, amount, month, status)
        VALUES (agency1_id, 450.00, '2026-04', 'approved');
    END IF;
END $$;
*/
