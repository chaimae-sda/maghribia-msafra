-- ================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN DEFAULT FALSE;

INSERT INTO public.profiles (id, full_name, email, city, bio, hobbies, is_verified, avatar_url, role, rating, trips_count, hosting_count, is_ambassador)
VALUES 
  ('7490b5d1-569c-4f55-8af7-cbff8cae98d3', 'Salma Idrissi', 'salma.idrissi@maghribia.ma', 'Fès', 'Passionnée par l''architecture de ma ville natale, Fès. J''adore accueillir des voyageuses.', '{Randonnée, Cuisine, "Art & Culture"}', true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'host', 4.9, 12, 34, true),
  ('c2a6c984-9c89-477e-acb9-b2c94514ea9f', 'Yasmine Benkirane', 'yasmine.benkirane@maghribia.ma', 'Essaouira', 'Surfeuse dans l''âme et amoureuse du vent d''Essaouira. Mon appartement est ouvert à toutes !', '{Surf, Méditation, Photographie}', true, 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400', 'traveler', 4.8, 24, 18, true),
  ('422906f0-2a53-4c7d-8e48-dcaab3ab3cc0', 'Fatima Zohra', 'fatima.zohra@maghribia.ma', 'Marrakech', 'Globe-trotteuse marocaine. J''ai parcouru le Maroc de Tanger à Dakhla.', '{Exploration urbaine, Gastronomie, Musique}', true, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'traveler', 4.9, 45, 52, true),
  ('6228fffd-acba-49fe-bdb6-afc4fe1aa476', 'Khadija Amrani', 'khadija.amrani@maghribia.ma', 'Rabat', 'Amoureuse de la nature et du calme. Je vis entre Rabat et les montagnes du Rif.', '{Lecture, Jardinage, Plage}', true, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'host', 4.7, 8, 8, true)
ON CONFLICT (id) DO UPDATE SET
  is_verified = true,
  is_ambassador = true,
  role = EXCLUDED.role,
  city = EXCLUDED.city;
