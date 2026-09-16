-- Campos completos do perfil do membro (execute uma vez no SQL Editor do projeto avpbrlhofxgonaliagvs)

ALTER TABLE public.adae_member_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS alumni_college TEXT,
  ADD COLUMN IF NOT EXISTS chapter_name TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS is_mason BOOLEAN;

-- Políticas de foto (se ainda não existirem)
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
