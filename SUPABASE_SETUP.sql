-- FILM4U AI - SUPABASE BACKEND SETUP SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- STEP 1: CLEAN UP EXISTING TABLES (if any)
----------------------------------------------------------------
DROP TABLE IF EXISTS public.watch_history CASCADE;
DROP TABLE IF EXISTS public.user_library CASCADE;
DROP TABLE IF EXISTS public.movies_ott CASCADE;
DROP TABLE IF EXISTS public.movies_indie CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 2: CREATE TABLES
----------------------------------------------------------------

-- Profiles table (linked to Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_moods TEXT[] DEFAULT '{}',
  sensitivity_toggles JSONB DEFAULT '{"violence": false, "sadness": false}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indie Movies table (Uploaded by creators)
CREATE TABLE public.movies_indie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  poster TEXT,
  banner TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT,
  release_date DATE,
  stream_url TEXT,
  is_indie BOOLEAN DEFAULT TRUE,
  creator_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTT Movies table (Mirror for external content)
CREATE TABLE public.movies_ott (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster TEXT,
  banner TEXT,
  platform TEXT,
  release_date DATE,
  tags TEXT[] DEFAULT '{}',
  language TEXT,
  moods TEXT[] DEFAULT '{}',
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Library (Favorites / Watchlist)
CREATE TABLE public.user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_type TEXT NOT NULL,
  list_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id, list_type)
);

-- Watch History (For AI Personalization)
CREATE TABLE public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_type TEXT NOT NULL,
  genre TEXT,
  language TEXT,
  mood_at_watch TEXT,
  time_of_day TEXT,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
----------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies_indie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies_ott ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- STEP 4: CREATE RLS POLICIES
----------------------------------------------------------------

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Indie Movies: Anyone can read, only authenticated users can upload
CREATE POLICY "Anyone can view indie movies" ON public.movies_indie 
  FOR SELECT USING (true);
  
CREATE POLICY "Authenticated users can upload indie movies" ON public.movies_indie 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- OTT Movies: Anyone can read
CREATE POLICY "Anyone can view ott movies" ON public.movies_ott 
  FOR SELECT USING (true);

-- User Library: Users can only manage their own library
CREATE POLICY "Users can view own library" ON public.user_library 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage own library" ON public.user_library 
  FOR ALL USING (auth.uid() = user_id);

-- Watch History: Users can only manage their own history
CREATE POLICY "Users can view own history" ON public.watch_history 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own history" ON public.watch_history 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- STEP 5: AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, preferred_genres, preferred_moods, sensitivity_toggles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NULL,
    '{}',
    '{}',
    '{"violence": false, "sadness": false}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: SEED DATA (Sample Movies)
----------------------------------------------------------------
INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('tmdb_1', 'Interstellar', 'AI Summary: A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 
 'https://image.tmdb.org/t/p/w500/gEU2QniL6E8ahMcafCUWTmoJyDf.jpg', 
 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIVQ.jpg', 
 'Netflix', '2014-11-05', 
 '{Sci-Fi,Drama,Adventure}', 'English', '{Bored,Thinking}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('tmdb_2', 'Minnal Murali', 'AI Summary: A tailor gains special powers after being struck by lightning. A grounded, heartfelt superhero tale from Kerala.', 
 'https://image.tmdb.org/t/p/w500/ytw9BqXz92n8Q7X79nLpTqBgJz.jpg', 
 'https://image.tmdb.org/t/p/original/2wP5H6FqJ2F1S9qK6r9J5q5.jpg', 
 'Netflix', '2021-12-24', 
 '{Action,Comedy,Malayalam}', 'Malayalam', '{Hype,Comfort}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('tmdb_3', 'The Boys', 'AI Summary: A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.', 
 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg', 
 'https://image.tmdb.org/t/p/original/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg', 
 'Amazon Prime', '2019-07-26', 
 '{Action,Thriller,Satire}', 'English', '{Dark,Hype}', 'Series');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('tmdb_533535', 'Deadpool & Wolverine', 'AI Summary: A listless Wade Wilson toils away in civilian life. His days as the morally flexible mercenary, Deadpool, behind him. When his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant… Wolverine?', 
 'https://image.tmdb.org/t/p/w500/8cdWjvZQUvS6Upty083p2q9bmCl.jpg', 
 'https://image.tmdb.org/t/p/original/yDHYTfKGqDCRIIqo664sY9XZIVQ.jpg', 
 'Disney+ Hotstar', '2024-07-26', 
 '{Action,Comedy,Adventure}', 'English', '{Hype,Excited}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('tmdb_1001311', 'Kalki 2898 AD', 'AI Summary: A modern avatar of Vishnu, a Hindu god, is believed to have descended to earth to protect the world from evil forces. An epic sci-fi journey set in a dystopian future.', 
 'https://image.tmdb.org/t/p/w500/6vAByoY4o9K4P9v0GvQNooXIsL6.jpg', 
 'https://image.tmdb.org/t/p/original/st8i989PT6cgHpYS9gn39S6vS8U.jpg', 
 'Netflix', '2024-06-27', 
 '{Sci-Fi,Action,Mythology}', 'Telugu', '{Hype,Thinking}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('tmdb_136315', 'The Bear', 'AI Summary: A young chef from the fine dining world returns to Chicago to run his family''s sandwich shop. Intense, heartfelt, and incredibly fast-paced.', 
 'https://image.tmdb.org/t/p/w500/m87f6v0m0S0m0S0m0S0m0S0m0S.jpg', 
 'https://image.tmdb.org/t/p/original/the_bear_backdrop.jpg', 
 'Disney+ Hotstar', '2022-06-23', 
 '{Drama,Comedy}', 'English', '{Comfort,Dark}', 'Series');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_101', 'Lokah Chapter One: Chandra', 'AI Summary: Malayalam cinema''s first female superhero epic. Chandra, a mysterious savior, arises to protect the city from a dark underworld syndicate.', 
 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1500&q=80', 
 'JioHotstar', '2025-08-28', 
 '{Malayalam,Superhero,Action}', 'Malayalam', '{Hype,Excited}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_102', 'Kalamkaval', 'AI Summary: SI Jayakrishnan uncovers a chilling pattern of missing women in Trivandrum, leading to a psychological face-off with a shadowy killer.', 
 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1500&q=80', 
 'Theaters', '2025-12-05', 
 '{Malayalam,Thriller,Crime}', 'Malayalam', '{Dark,Thinking}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_103', 'Bha Bha Bha', 'AI Summary: A madcap political action comedy where a nameless man hijacks the Chief Minister''s car, triggering a chaotic investigation and a gangster rivalry.', 
 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&w=1500&q=80', 
 'Theaters', '2025-12-18', 
 '{Malayalam,Comedy,Action}', 'Malayalam', '{Hype,Fun}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_104', 'Eko', 'AI Summary: A mystery thriller set in the misty slopes of Kaattukunnu, tracking the disappearance of a legendary criminal across multiple timelines.', 
 'https://images.unsplash.com/photo-1500462859194-88585f59196c?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=80', 
 'Netflix', '2025-11-21', 
 '{Malayalam,Mystery,Thriller}', 'Malayalam', '{Thinking,Chill}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_105', 'The Pet Detective', 'AI Summary: A young man takes over his father''s detective agency to impress his girlfriend, only to get entangled in an exotic animal smuggling ring.', 
 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=1500&q=80', 
 'Zee5', '2025-10-16', 
 '{Malayalam,Comedy,Mystery}', 'Malayalam', '{Comfort,Fun}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_106', 'Dies Irae', 'AI Summary: A relentless psychological horror where a man''s past comes back to haunt him in the form of a vengeful spirit. A dark, atmospheric journey.', 
 'https://images.unsplash.com/photo-1505633546681-945bb1ed91da?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1500&q=80', 
 'Theaters', '2025-10-31', 
 '{Malayalam,Horror,Thriller}', 'Malayalam', '{Dark,Sad}', 'Movie');

INSERT INTO public.movies_ott (id, title, description, poster, banner, platform, release_date, tags, language, moods, type)
VALUES 
('malyalam_107', 'Sahasam', 'AI Summary: A chaotic comedy of errors spanning one single day, where an eloping couple''s path crosses with crypto-gangsters and a narcotics agent.', 
 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80', 
 'https://images.unsplash.com/photo-1512113569143-121288b74ff5?auto=format&fit=crop&w=1500&q=80', 
 'Sun NXT', '2025-08-08', 
 '{Malayalam,Action,Comedy}', 'Malayalam', '{Hype,Excited}', 'Movie');


-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Film4u AI Database Setup Complete!';
  RAISE NOTICE '📊 Tables created: profiles, movies_indie, movies_ott, user_library, watch_history';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🤖 Auto-profile creation trigger activated';
  RAISE NOTICE '🎬 3 sample movies added';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEPS:';
  RAISE NOTICE '1. Go to Authentication → Providers → Email';
  RAISE NOTICE '2. Disable "Confirm email" for testing';
  RAISE NOTICE '3. Create storage buckets: videos, posters, avatars (set to Public)';
  RAISE NOTICE '4. Test signup at your app!';
END $$;
