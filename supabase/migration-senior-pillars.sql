-- Pilares da seção Sêniors (Fraternidade, Serviço, Tradição)
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

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
