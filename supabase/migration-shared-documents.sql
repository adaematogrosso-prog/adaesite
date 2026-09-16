-- Documentos compartilhados para membros aprovados
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

CREATE TABLE IF NOT EXISTS public.adae_shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_kind TEXT NOT NULL CHECK (file_kind IN ('pdf', 'image')),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.adae_shared_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved members can view shared documents" ON public.adae_shared_documents;
CREATE POLICY "Approved members can view shared documents"
  ON public.adae_shared_documents
  FOR SELECT
  USING (
    is_active = true
    AND (
      public.adae_can_approve_memberships(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.adae_member_profiles
        WHERE user_id = auth.uid() AND status = 'approved'
      )
    )
  );

DROP POLICY IF EXISTS "Approvers can manage shared documents" ON public.adae_shared_documents;
CREATE POLICY "Approvers can manage shared documents"
  ON public.adae_shared_documents
  FOR ALL
  USING (public.adae_can_approve_memberships(auth.uid()))
  WITH CHECK (public.adae_can_approve_memberships(auth.uid()));

CREATE OR REPLACE FUNCTION public.adae_shared_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS adae_shared_documents_updated_at ON public.adae_shared_documents;
CREATE TRIGGER adae_shared_documents_updated_at
  BEFORE UPDATE ON public.adae_shared_documents
  FOR EACH ROW EXECUTE FUNCTION public.adae_shared_documents_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-shared-documents',
  'adae-shared-documents',
  true,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Approved members can view shared document files" ON storage.objects;
CREATE POLICY "Approved members can view shared document files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'adae-shared-documents'
    AND (
      public.adae_can_approve_memberships(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.adae_member_profiles
        WHERE user_id = auth.uid() AND status = 'approved'
      )
    )
  );

DROP POLICY IF EXISTS "Approvers can upload shared document files" ON storage.objects;
CREATE POLICY "Approvers can upload shared document files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-shared-documents'
    AND public.adae_can_approve_memberships(auth.uid())
  );

DROP POLICY IF EXISTS "Approvers can update shared document files" ON storage.objects;
CREATE POLICY "Approvers can update shared document files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-shared-documents'
    AND public.adae_can_approve_memberships(auth.uid())
  );

DROP POLICY IF EXISTS "Approvers can delete shared document files" ON storage.objects;
CREATE POLICY "Approvers can delete shared document files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-shared-documents'
    AND public.adae_can_approve_memberships(auth.uid())
  );
