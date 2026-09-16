-- Cadastro com ID DeMolay e aprovação de adesão
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

CREATE TABLE IF NOT EXISTS public.adae_member_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id)
);

ALTER TABLE public.adae_executive_members
  ADD COLUMN IF NOT EXISTS linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.adae_can_approve_memberships(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.adae_admin_users
    WHERE user_id = check_user_id
  )
  OR EXISTS (
    SELECT 1 FROM public.adae_executive_members
    WHERE linked_user_id = check_user_id
      AND role IN ('presidente', 'vice_presidente')
      AND is_active = true
  );
$$;

ALTER TABLE public.adae_member_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own member profile" ON public.adae_member_profiles;
CREATE POLICY "Users can view own member profile"
  ON public.adae_member_profiles
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Approvers can view all member profiles" ON public.adae_member_profiles;
CREATE POLICY "Approvers can view all member profiles"
  ON public.adae_member_profiles
  FOR SELECT
  USING (public.adae_can_approve_memberships(auth.uid()));

DROP POLICY IF EXISTS "Users can create own pending profile" ON public.adae_member_profiles;
CREATE POLICY "Users can create own pending profile"
  ON public.adae_member_profiles
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Approvers can update member profiles" ON public.adae_member_profiles;
CREATE POLICY "Approvers can update member profiles"
  ON public.adae_member_profiles
  FOR UPDATE
  USING (public.adae_can_approve_memberships(auth.uid()))
  WITH CHECK (public.adae_can_approve_memberships(auth.uid()));

CREATE OR REPLACE FUNCTION public.adae_member_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS adae_member_profiles_updated_at ON public.adae_member_profiles;
CREATE TRIGGER adae_member_profiles_updated_at
  BEFORE UPDATE ON public.adae_member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.adae_member_profiles_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_adae_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data ->> 'member_id', '') = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.adae_member_profiles (
    user_id,
    member_id,
    full_name,
    email,
    status
  )
  VALUES (
    NEW.id,
    UPPER(NEW.raw_user_meta_data ->> 'member_id'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    'pending'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_adae ON auth.users;
CREATE TRIGGER on_auth_user_created_adae
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_adae_user();

-- Vincular presidente/vice à conta para aprovar adesões:
-- UPDATE public.adae_executive_members
-- SET linked_user_id = 'UUID-DO-USUARIO'
-- WHERE role IN ('presidente', 'vice_presidente');
