-- ============================================================
-- ADAE-MT: setup completo no projeto correto do Supabase
-- Projeto do app (.env.local): avpbrlhofxgonaliagvs
-- Execute TUDO no SQL Editor do Supabase desse projeto.
-- ============================================================

-- 1) Tabela da diretoria executiva
CREATE TABLE IF NOT EXISTS public.adae_executive_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN (
    'presidente',
    'vice_presidente',
    'secretario',
    'secretario_adjunto',
    'tesoureiro',
    'tesoureiro_adjunto',
    'secretario_assistencia_social',
    'secretario_assistencia_social_adjunto'
  )),
  name TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role)
);

-- 2) Tabela de admins
CREATE TABLE IF NOT EXISTS public.adae_admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) RLS
ALTER TABLE public.adae_executive_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active executive members" ON public.adae_executive_members;
CREATE POLICY "Public can view active executive members"
  ON public.adae_executive_members
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage executive members" ON public.adae_executive_members;
CREATE POLICY "Admins can manage executive members"
  ON public.adae_executive_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view admin list" ON public.adae_admin_users;
CREATE POLICY "Admins can view admin list"
  ON public.adae_admin_users
  FOR SELECT
  USING (user_id = auth.uid());

-- 4) Cargos iniciais da diretoria
INSERT INTO public.adae_executive_members (role, name, display_order) VALUES
  ('presidente', '', 1),
  ('vice_presidente', '', 2),
  ('secretario', '', 3),
  ('secretario_adjunto', '', 4),
  ('tesoureiro', '', 5),
  ('tesoureiro_adjunto', '', 6),
  ('secretario_assistencia_social', '', 7),
  ('secretario_assistencia_social_adjunto', '', 8)
ON CONFLICT (role) DO NOTHING;

-- 5) Função para conceder admin (use no SQL Editor)
CREATE OR REPLACE FUNCTION public.adae_grant_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuario nao encontrado em auth.users: %', target_user_id;
  END IF;

  INSERT INTO public.adae_admin_users (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.adae_grant_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adae_grant_admin(uuid) TO postgres, service_role;

-- 6) Conceder admin ao usuário Admin ADAE
SELECT public.adae_grant_admin('5c0e0b1f-8cb2-4f19-bf34-03fd115b8c66');

-- 7) Bucket de fotos da diretoria
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-executive-photos',
  'adae-executive-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view ADAE executive photos" ON storage.objects;
CREATE POLICY "Public can view ADAE executive photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'adae-executive-photos');

DROP POLICY IF EXISTS "Admins can upload ADAE executive photos" ON storage.objects;
CREATE POLICY "Admins can upload ADAE executive photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-executive-photos'
    AND EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update ADAE executive photos" ON storage.objects;
CREATE POLICY "Admins can update ADAE executive photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-executive-photos'
    AND EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can delete ADAE executive photos" ON storage.objects;
CREATE POLICY "Admins can delete ADAE executive photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-executive-photos'
    AND EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Verificar se deu certo:
SELECT * FROM public.adae_admin_users;

-- 8) Pilares da seção Sêniors (Fraternidade, Serviço, Tradição)
CREATE TABLE IF NOT EXISTS public.adae_senior_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE CHECK (key IN ('fraternidade', 'servico', 'tradicao')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.adae_senior_pillars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active senior pillars" ON public.adae_senior_pillars;
CREATE POLICY "Public can view active senior pillars"
  ON public.adae_senior_pillars
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage senior pillars" ON public.adae_senior_pillars;
CREATE POLICY "Admins can manage senior pillars"
  ON public.adae_senior_pillars
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.adae_admin_users
      WHERE user_id = auth.uid()
    )
  );

INSERT INTO public.adae_senior_pillars (key, title, description, display_order) VALUES
  ('fraternidade', 'Fraternidade', 'Laços que ultrapassam gerações e estados.', 1),
  ('servico', 'Serviço', 'Assistência social e apoio contínuo à comunidade.', 2),
  ('tradicao', 'Tradição', 'Preservação dos valores e história da Ordem DeMolay.', 3)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.adae_senior_pillars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS adae_senior_pillars_updated_at ON public.adae_senior_pillars;
CREATE TRIGGER adae_senior_pillars_updated_at
  BEFORE UPDATE ON public.adae_senior_pillars
  FOR EACH ROW EXECUTE FUNCTION public.adae_senior_pillars_updated_at();
