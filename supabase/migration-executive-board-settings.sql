-- Gestão e chapa da diretoria executiva (ex.: 2026/2027 · União e Legado)
-- Execute no SQL Editor do projeto Supabase

CREATE TABLE IF NOT EXISTS public.adae_executive_board_settings (
  id text PRIMARY KEY DEFAULT 'current' CHECK (id = 'current'),
  management_term text NOT NULL DEFAULT '',
  slate_name text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.adae_executive_board_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view executive board settings"
  ON public.adae_executive_board_settings;
CREATE POLICY "Public can view executive board settings"
  ON public.adae_executive_board_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Approvers can update executive board settings"
  ON public.adae_executive_board_settings;
CREATE POLICY "Approvers can update executive board settings"
  ON public.adae_executive_board_settings
  FOR UPDATE
  USING (public.adae_can_approve_memberships(auth.uid()))
  WITH CHECK (public.adae_can_approve_memberships(auth.uid()));

DROP POLICY IF EXISTS "Approvers can insert executive board settings"
  ON public.adae_executive_board_settings;
CREATE POLICY "Approvers can insert executive board settings"
  ON public.adae_executive_board_settings
  FOR INSERT
  WITH CHECK (public.adae_can_approve_memberships(auth.uid()));

INSERT INTO public.adae_executive_board_settings (id, management_term, slate_name)
VALUES ('current', '2026/2027', 'União e Legado')
ON CONFLICT (id) DO NOTHING;
