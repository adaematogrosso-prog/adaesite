-- Campos extras no perfil do membro: aniversário, telefone e foto
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

ALTER TABLE public.adae_member_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

DROP POLICY IF EXISTS "Approved members can update own profile" ON public.adae_member_profiles;
CREATE POLICY "Approved members can update own profile"
  ON public.adae_member_profiles
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'approved')
  WITH CHECK (user_id = auth.uid() AND status = 'approved');

DROP POLICY IF EXISTS "Approved members can upload profile photos" ON storage.objects;
CREATE POLICY "Approved members can upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-executive-photos'
    AND (storage.foldername(name))[1] = 'profiles'
    AND EXISTS (
      SELECT 1 FROM public.adae_member_profiles
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Approved members can update profile photos" ON storage.objects;
CREATE POLICY "Approved members can update profile photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-executive-photos'
    AND (storage.foldername(name))[1] = 'profiles'
    AND EXISTS (
      SELECT 1 FROM public.adae_member_profiles
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

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
    phone,
    birth_date,
    status
  )
  VALUES (
    NEW.id,
    UPPER(NEW.raw_user_meta_data ->> 'member_id'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'birth_date', '')::date,
    'pending'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
