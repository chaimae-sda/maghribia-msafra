-- ================================================
-- SOCIAL PERSISTENCE SETUP
-- ================================================

-- 1. Create Comments Table if not exists
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Likes Table if not exists
CREATE TABLE IF NOT EXISTS public.likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- 3. Seed Social Data for "Chaimae Saadi"
-- We use a DO block to find current IDs dynamically
DO $$
DECLARE
    target_user_id UUID;
    new_post_id UUID;
    salma_id UUID := '7490b5d1-569c-4f55-8af7-cbff8cae98d3';
    yasmine_id UUID := 'c2a6c984-9c89-477e-acb9-b2c94514ea9f';
BEGIN
    -- Find the user ID
    SELECT id INTO target_user_id FROM public.profiles 
    WHERE full_name ILIKE '%Chaimae Saadi%' 
       OR full_name ILIKE '%Chaimae%' 
    LIMIT 1;

    -- If user found, create the real post
    IF target_user_id IS NOT NULL THEN
        -- Delete any previous mock post if it exists by content match
        DELETE FROM public.posts WHERE user_id = target_user_id AND content LIKE 'De retour de mon voyage%';

        -- Insert the real post
        INSERT INTO public.posts (user_id, content, image_url, city)
        VALUES (
            target_user_id, 
            'De retour de mon voyage à Chefchaouen, la perle bleue du Nord ! Une expérience inoubliable avec des rencontres incroyables. 💙✨',
            'https://images.unsplash.com/photo-1548043034-4bc043a53f93?q=80&w=1200&auto=format&fit=crop',
            'Chefchaouen'
        )
        RETURNING id INTO new_post_id;

        -- Insert real comments from ambassadors
        INSERT INTO public.comments (post_id, user_id, content)
        VALUES 
            (new_post_id, salma_id, 'C''est magnifique ! La perle bleue ne décoit jamais. 😍'),
            (new_post_id, yasmine_id, 'Génial ! Il faudra qu''on y aille ensemble la prochaine fois ! 💙');

        -- Insert real like from Salma
        INSERT INTO public.likes (post_id, user_id)
        VALUES (new_post_id, salma_id);
    END IF;
END $$;
