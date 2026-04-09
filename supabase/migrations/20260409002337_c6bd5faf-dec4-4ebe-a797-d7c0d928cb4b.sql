
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'externo' CHECK (user_type IN ('externo', 'interno')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER_ROLES TABLE
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'oficina' CHECK (type IN ('oficina', 'minicurso', 'palestra')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  total_slots INT NOT NULL DEFAULT 30,
  available_slots INT NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'encerrada', 'cancelada')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- REGISTRATIONS TABLE
-- ============================================
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inscrita' CHECK (status IN ('inscrita', 'confirmada', 'cancelada', 'presente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTION: has_role
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- HELPER FUNCTION: is_admin (checks user_type = 'interno' in profiles)
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND user_type = 'interno'
  )
$$;

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'externo')
  );
  
  -- If user_type is 'interno', also give admin role
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'externo') = 'interno' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DB FUNCTION: register_for_activity (atomic)
-- ============================================
CREATE OR REPLACE FUNCTION public.register_for_activity(p_activity_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity activities%ROWTYPE;
  v_existing BOOLEAN;
  v_effective_status TEXT;
BEGIN
  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Atividade não encontrada.');
  END IF;

  -- Determine effective status
  IF v_activity.status = 'cancelada' THEN
    v_effective_status := 'cancelada';
  ELSIF v_activity.status = 'encerrada' OR v_activity.end_date < now() THEN
    v_effective_status := 'encerrada';
  ELSIF v_activity.available_slots <= 0 THEN
    v_effective_status := 'lotada';
  ELSE
    v_effective_status := 'aberta';
  END IF;

  IF v_effective_status = 'encerrada' THEN
    RETURN json_build_object('success', false, 'message', 'Esta atividade já foi encerrada.');
  END IF;
  IF v_effective_status = 'cancelada' THEN
    RETURN json_build_object('success', false, 'message', 'Esta atividade foi cancelada.');
  END IF;
  IF v_effective_status = 'lotada' THEN
    RETURN json_build_object('success', false, 'message', 'Não há vagas disponíveis.');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM registrations
    WHERE activity_id = p_activity_id AND user_id = p_user_id AND status != 'cancelada'
  ) INTO v_existing;

  IF v_existing THEN
    RETURN json_build_object('success', false, 'message', 'Você já está inscrita nesta atividade.');
  END IF;

  INSERT INTO registrations (activity_id, user_id, status)
  VALUES (p_activity_id, p_user_id, 'inscrita');

  UPDATE activities SET available_slots = available_slots - 1
  WHERE id = p_activity_id;

  RETURN json_build_object('success', true, 'message', 'Inscrição realizada com sucesso!');
END;
$$;

-- ============================================
-- DB FUNCTION: cancel_registration (atomic)
-- ============================================
CREATE OR REPLACE FUNCTION public.cancel_registration(p_registration_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
BEGIN
  SELECT * INTO v_reg FROM registrations WHERE id = p_registration_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Inscrição não encontrada.');
  END IF;

  IF v_reg.user_id != p_user_id AND NOT is_admin(p_user_id) THEN
    RETURN json_build_object('success', false, 'message', 'Sem permissão.');
  END IF;

  IF v_reg.status = 'cancelada' THEN
    RETURN json_build_object('success', false, 'message', 'Inscrição já cancelada.');
  END IF;

  UPDATE registrations SET status = 'cancelada' WHERE id = p_registration_id;
  UPDATE activities SET available_slots = available_slots + 1 WHERE id = v_reg.activity_id;

  RETURN json_build_object('success', true, 'message', 'Inscrição cancelada com sucesso.');
END;
$$;

-- ============================================
-- RLS POLICIES: profiles
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES: user_roles (no direct access, only via security definer)
-- ============================================
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES: activities
-- ============================================
CREATE POLICY "Anyone can view activities"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update activities"
  ON public.activities FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete activities"
  ON public.activities FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: registrations
-- ============================================
CREATE POLICY "Users can view own registrations"
  ON public.registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON public.registrations FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own registrations"
  ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
  ON public.registrations FOR UPDATE
  USING (auth.uid() = user_id);
