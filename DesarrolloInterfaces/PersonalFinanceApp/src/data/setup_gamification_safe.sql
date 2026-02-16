-- Create Missions table if not exists
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER NOT NULL DEFAULT 10,
  type TEXT CHECK (type IN ('daily', 'weekly', 'achievement', 'main')),
  icon TEXT,
  condition JSONB, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Policy for Missions
DROP POLICY IF EXISTS "Missions are viewable by everyone" ON public.missions;
CREATE POLICY "Missions are viewable by everyone" 
ON public.missions FOR SELECT 
USING (true);

-- Create User Missions table if not exists
CREATE TABLE IF NOT EXISTS public.user_missions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'claimed')) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, mission_id)
);

-- Enable RLS on User Missions
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Policies for User Missions
DROP POLICY IF EXISTS "Users can view their own mission progress" ON public.user_missions;
CREATE POLICY "Users can view their own mission progress" 
ON public.user_missions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mission progress" ON public.user_missions;
CREATE POLICY "Users can update their own mission progress" 
ON public.user_missions FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mission progress" ON public.user_missions;
CREATE POLICY "Users can insert their own mission progress" 
ON public.user_missions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on sign up (Safe to replace)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email)
  ON CONFLICT (id) DO NOTHING; -- Safe insert
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed data (Check for existence)
INSERT INTO public.missions (title, description, reward_points, type, icon) 
SELECT 'Primeros Pasos', 'Registra tu primera transacción.', 50, 'achievement', 'footsteps'
WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE title = 'Primeros Pasos');

INSERT INTO public.missions (title, description, reward_points, type, icon) 
SELECT 'Ahorrador Novato', 'Crea un presupuesto mensual.', 100, 'achievement', 'savings'
WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE title = 'Ahorrador Novato');

INSERT INTO public.missions (title, description, reward_points, type, icon) 
SELECT 'Mercader Diario', 'Registra 3 gastos hoy.', 20, 'daily', 'receipt_long'
WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE title = 'Mercader Diario');

INSERT INTO public.missions (title, description, reward_points, type, icon) 
SELECT 'Guardián del Tesoro', 'No gastes nada en un día.', 50, 'daily', 'lock'
WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE title = 'Guardián del Tesoro');
