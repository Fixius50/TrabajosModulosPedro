-- Create Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create Missions table
CREATE TABLE public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER NOT NULL DEFAULT 10,
  type TEXT CHECK (type IN ('daily', 'weekly', 'achievement', 'main')),
  icon TEXT,
  condition JSONB, -- e.g. {"target": 5, "metric": "transaction_count"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Missions are viewable by everyone" 
ON public.missions FOR SELECT 
USING (true);

-- Create User Missions table
CREATE TABLE public.user_missions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'claimed')) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, mission_id)
);

-- Enable RLS on User Missions
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mission progress" 
ON public.user_missions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission progress" 
ON public.user_missions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission progress" 
ON public.user_missions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed some initial missions
INSERT INTO public.missions (title, description, reward_points, type, icon) VALUES
('Primeros Pasos', 'Registra tu primera transacción.', 50, 'achievement', 'footsteps'),
('Ahorrador Novato', 'Crea un presupuesto mensual.', 100, 'achievement', 'savings'),
('Mercader Diario', 'Registra 3 gastos hoy.', 20, 'daily', 'receipt_long'),
('Guardián del Tesoro', 'No gastes nada en un día.', 50, 'daily', 'lock');
