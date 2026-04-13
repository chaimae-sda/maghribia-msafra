-- ================================================
-- SOCIAL PERSISTENCE FINAL SETUP
-- ================================================

-- 1. Update Posts Schema
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_disabled BOOLEAN DEFAULT FALSE;

-- 2. Seed Ambassador Posts into Database
-- This allows real likes and comments on their posts
DO $$
DECLARE
    salma_id UUID := '7490b5d1-569c-4f55-8af7-cbff8cae98d3';
    yasmine_id UUID := 'c2a6c984-9c89-477e-acb9-b2c94514ea9f';
    fatima_id UUID := '422906f0-2a53-4c7d-8e48-dcaab3ab3cc0';
    khadija_id UUID := '6228fffd-acba-49fe-bdb6-afc4fe1aa476';
BEGIN
    -- Salma's Post
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = salma_id) THEN
        INSERT INTO public.posts (user_id, content, image_url, city, created_at)
        VALUES (salma_id, 'Le soleil se lève sur la Médina... Quel calme avant l''effervescence de la journée. Venez me voir à Fès ! #Fes #MaghribiaMsafra', 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800', 'Fès', '2024-04-10T08:00:00Z');
    END IF;

    -- Yasmine's Post
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = yasmine_id) THEN
        INSERT INTO public.posts (user_id, content, image_url, city, created_at)
        VALUES (yasmine_id, 'Session surf incroyable ce matin à Sidi Kaouki. Le vent était parfait ! 🏄‍♀️🌊', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800', 'Essaouira', '2024-04-11T10:00:00Z');
    END IF;

    -- Fatima's Post
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = fatima_id) THEN
        INSERT INTO public.posts (user_id, content, image_url, city, created_at)
        VALUES (fatima_id, 'Même après 100 fois, la Place Jemaa el-Fna m''émerveille toujours autant le soir. #Marrakech', 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800', 'Marrakech', '2024-04-13T19:00:00Z');
    END IF;

    -- Khadija's Post
    IF NOT EXISTS (SELECT 1 FROM public.posts WHERE user_id = khadija_id) THEN
        INSERT INTO public.posts (user_id, content, image_url, city, created_at)
        VALUES (khadija_id, 'Petite balade aux Oudayas ce midi. Un havre de paix bleu et blanc. 💙', 'https://images.unsplash.com/photo-1530182622561-af27821ad5c2?w=800', 'Rabat', '2024-04-13T15:00:00Z');
    END IF;
END $$;
