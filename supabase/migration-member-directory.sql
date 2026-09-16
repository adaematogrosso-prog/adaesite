-- Diretório de membros: localização, capítulo e leitura entre aprovados
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

ALTER TABLE public.adae_member_profiles
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS alumni_college TEXT,
  ADD COLUMN IF NOT EXISTS chapter_name TEXT;

DROP POLICY IF EXISTS "Approved members can view approved profiles" ON public.adae_member_profiles;
CREATE POLICY "Approved members can view approved profiles"
  ON public.adae_member_profiles
  FOR SELECT
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.adae_member_profiles viewer
      WHERE viewer.user_id = auth.uid()
        AND viewer.status = 'approved'
    )
  );
