-- Profissão, escolaridade e maçonaria no perfil do membro
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

ALTER TABLE public.adae_member_profiles
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS is_mason BOOLEAN;
