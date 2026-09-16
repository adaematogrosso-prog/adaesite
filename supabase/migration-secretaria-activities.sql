-- Atividades da Secretaria Estadual
-- Requer migration-secretaria.sql (função adae_can_access_secretaria)
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.adae_secretaria_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  banner_image_url TEXT,
  content TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS adae_secretaria_activities_published_idx
  ON public.adae_secretaria_activities (is_published, created_at DESC);

ALTER TABLE public.adae_secretaria_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published secretaria activities" ON public.adae_secretaria_activities;
CREATE POLICY "Anyone can view published secretaria activities"
  ON public.adae_secretaria_activities
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Secretaria can manage activities" ON public.adae_secretaria_activities;
CREATE POLICY "Secretaria can manage activities"
  ON public.adae_secretaria_activities
  FOR ALL
  USING (public.adae_can_access_secretaria(auth.uid()))
  WITH CHECK (public.adae_can_access_secretaria(auth.uid()));

DROP TRIGGER IF EXISTS adae_secretaria_activities_updated_at ON public.adae_secretaria_activities;
CREATE TRIGGER adae_secretaria_activities_updated_at
  BEFORE UPDATE ON public.adae_secretaria_activities
  FOR EACH ROW EXECUTE FUNCTION public.adae_secretaria_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-secretaria-activities',
  'adae-secretaria-activities',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view secretaria activity files" ON storage.objects;
CREATE POLICY "Anyone can view secretaria activity files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'adae-secretaria-activities');

DROP POLICY IF EXISTS "Secretaria can upload activity files" ON storage.objects;
CREATE POLICY "Secretaria can upload activity files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-secretaria-activities'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Secretaria can update activity files" ON storage.objects;
CREATE POLICY "Secretaria can update activity files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-secretaria-activities'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Secretaria can delete activity files" ON storage.objects;
CREATE POLICY "Secretaria can delete activity files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-secretaria-activities'
    AND public.adae_can_access_secretaria(auth.uid())
  );
