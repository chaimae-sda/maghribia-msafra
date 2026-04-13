-- ================================================
-- FINAL FEATURES SETUP & SEEDING
-- ================================================

-- 1. Missing Columns on Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'traveler';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"instagram": "", "facebook": "", "tiktok": "", "rib": ""}'::jsonb;

-- 2. Friendships Table (Invitations)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, friend_id)
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

-- 5. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    date DATE NOT NULL,
    duration TEXT,
    price DECIMAL(10,2) NOT NULL,
    max_participants INT DEFAULT 20,
    image_url TEXT,
    rib TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    payment_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RLS Policies (Basic enabled for all)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Simple test policies (To be refined later)
CREATE POLICY "Friendships visible to participants" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their friendship status" ON public.friendships FOR UPDATE USING (auth.uid() = friend_id);

CREATE POLICY "Messages visible to participants" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages status" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Stories are viewable by everyone" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trips are viewable by everyone" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Agencies can manage their trips" ON public.trips FOR ALL USING (auth.uid() = agency_id);

CREATE POLICY "Bookings visible to user and agency" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND agency_id = auth.uid()));
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agencies can update booking status" ON public.bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND agency_id = auth.uid()));

-- 8. SEEDING DATA
DO $$
DECLARE
    current_user_id UUID;
    agency_id UUID := '11111111-1111-1111-1111-111111111111'; -- Dummy ID for seeding, will update
    salma_id UUID := '7490b5d1-569c-4f55-8af7-cbff8cae98d3';
    yasmine_id UUID := 'c2a6c984-9c89-477e-acb9-b2c94514ea9f';
    fatima_id UUID := '422906f0-2a53-4c7d-8e48-dcaab3ab3cc0';
    khadija_id UUID := '6228fffd-acba-49fe-bdb6-afc4fe1aa476';
BEGIN
    -- 1. Find the target user
    SELECT id INTO current_user_id FROM public.profiles WHERE email = 'gshja615@gmail.com';

    -- 2. NOTE: Agency account must be created via UI first
    -- We can only seed once it exists in auth.users
    SELECT id INTO agency_id FROM public.profiles WHERE email = 'agence.atlas@maghribia.ma';

    IF agency_id IS NOT NULL THEN
        UPDATE public.profiles SET role = 'agency', is_approved = true WHERE id = agency_id;
        
        -- Seed Organized Trip
        INSERT INTO public.trips (agency_id, title, description, destination, date, duration, price, max_participants, image_url, rib)
        VALUES 
        (agency_id, 'Escape Saharienne à Merzouga', '3 jours d''aventure dans le désert avec bivouac de luxe, balade en dromadaire et veillées sous les étoiles.', 'Merzouga', (NOW() + interval '30 days')::date, '3 jours', 2450.00, 15, 'https://images.unsplash.com/photo-1489491971871-2b0d2a4729f2?w=800', '007 123 4567890123 45')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. Seed Stories
    INSERT INTO public.stories (user_id, media_url, location)
    VALUES 
        (salma_id, 'https://images.unsplash.com/photo-1548043034-4bc043a53f93?w=600', 'Chefchaouen'),
        (yasmine_id, 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600', 'Essaouira')
    ON CONFLICT DO NOTHING;

    -- 4. Seed Invitations (Friend Requests)
    IF current_user_id IS NOT NULL THEN
        INSERT INTO public.friendships (user_id, friend_id, status)
        VALUES 
            (fatima_id, current_user_id, 'pending'),
            (khadija_id, current_user_id, 'pending')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. Seeding of trips is now handled above (inside the agency_id check)
END $$;
