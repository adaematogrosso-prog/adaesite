-- Notícias ADAE + permissão de publicação (documentos e notícias)
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

CREATE OR REPLACE FUNCTION public.adae_can_publish_content(check_user_id uuid)
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
      AND role IN (
        'presidente',
        'vice_presidente',
        'secretario',
        'secretario_adjunto'
      )
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.adae_can_publish_content(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adae_can_publish_content(uuid) TO authenticated;

-- Atualizar permissões de documentos
DROP POLICY IF EXISTS "Approvers can manage shared documents" ON public.adae_shared_documents;
CREATE POLICY "Publishers can manage shared documents"
  ON public.adae_shared_documents
  FOR ALL
  USING (public.adae_can_publish_content(auth.uid()))
  WITH CHECK (public.adae_can_publish_content(auth.uid()));

DROP POLICY IF EXISTS "Approvers can upload shared document files" ON storage.objects;
CREATE POLICY "Publishers can upload shared document files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-shared-documents'
    AND public.adae_can_publish_content(auth.uid())
  );

DROP POLICY IF EXISTS "Approvers can update shared document files" ON storage.objects;
CREATE POLICY "Publishers can update shared document files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-shared-documents'
    AND public.adae_can_publish_content(auth.uid())
  );

DROP POLICY IF EXISTS "Approvers can delete shared document files" ON storage.objects;
CREATE POLICY "Publishers can delete shared document files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-shared-documents'
    AND public.adae_can_publish_content(auth.uid())
  );

-- Notícias
CREATE TABLE IF NOT EXISTS public.adae_news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  cover_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.adae_news_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published news" ON public.adae_news_posts;
CREATE POLICY "Public can view published news"
  ON public.adae_news_posts
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Publishers can manage news" ON public.adae_news_posts;
CREATE POLICY "Publishers can manage news"
  ON public.adae_news_posts
  FOR ALL
  USING (public.adae_can_publish_content(auth.uid()))
  WITH CHECK (public.adae_can_publish_content(auth.uid()));

CREATE OR REPLACE FUNCTION public.adae_news_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS adae_news_posts_updated_at ON public.adae_news_posts;
CREATE TRIGGER adae_news_posts_updated_at
  BEFORE UPDATE ON public.adae_news_posts
  FOR EACH ROW EXECUTE FUNCTION public.adae_news_posts_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-news-images',
  'adae-news-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view news images" ON storage.objects;
CREATE POLICY "Public can view news images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'adae-news-images');

DROP POLICY IF EXISTS "Publishers can upload news images" ON storage.objects;
CREATE POLICY "Publishers can upload news images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-news-images'
    AND public.adae_can_publish_content(auth.uid())
  );

DROP POLICY IF EXISTS "Publishers can update news images" ON storage.objects;
CREATE POLICY "Publishers can update news images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-news-images'
    AND public.adae_can_publish_content(auth.uid())
  );

DROP POLICY IF EXISTS "Publishers can delete news images" ON storage.objects;
CREATE POLICY "Publishers can delete news images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-news-images'
    AND public.adae_can_publish_content(auth.uid())
  );
