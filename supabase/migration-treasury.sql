-- Tesouraria: PIX, lançamentos e comprovantes
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

CREATE OR REPLACE FUNCTION public.adae_can_access_tesouraria(check_user_id uuid)
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
        'tesoureiro',
        'tesoureiro_adjunto'
      )
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.adae_can_manage_treasury_pix(check_user_id uuid)
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
      AND role = 'presidente'
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.adae_can_access_tesouraria(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adae_can_access_tesouraria(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.adae_can_manage_treasury_pix(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adae_can_manage_treasury_pix(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS public.adae_treasury_pix_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL CHECK (
    pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')
  ),
  holder_name TEXT NOT NULL,
  holder_city TEXT NOT NULL,
  bank_label TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adae_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adae_treasury_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.adae_treasury_transactions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.adae_treasury_pix_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_treasury_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Treasury users can view pix settings" ON public.adae_treasury_pix_settings;
CREATE POLICY "Treasury users can view pix settings"
  ON public.adae_treasury_pix_settings
  FOR SELECT
  USING (public.adae_can_access_tesouraria(auth.uid()));

DROP POLICY IF EXISTS "President and admin can manage pix settings" ON public.adae_treasury_pix_settings;
CREATE POLICY "President and admin can manage pix settings"
  ON public.adae_treasury_pix_settings
  FOR ALL
  USING (public.adae_can_manage_treasury_pix(auth.uid()))
  WITH CHECK (public.adae_can_manage_treasury_pix(auth.uid()));

DROP POLICY IF EXISTS "Treasury users can view transactions" ON public.adae_treasury_transactions;
CREATE POLICY "Treasury users can view transactions"
  ON public.adae_treasury_transactions
  FOR SELECT
  USING (public.adae_can_access_tesouraria(auth.uid()));

DROP POLICY IF EXISTS "Treasury users can manage transactions" ON public.adae_treasury_transactions;
CREATE POLICY "Treasury users can manage transactions"
  ON public.adae_treasury_transactions
  FOR ALL
  USING (public.adae_can_access_tesouraria(auth.uid()))
  WITH CHECK (public.adae_can_access_tesouraria(auth.uid()));

DROP POLICY IF EXISTS "Treasury users can view receipts" ON public.adae_treasury_receipts;
CREATE POLICY "Treasury users can view receipts"
  ON public.adae_treasury_receipts
  FOR SELECT
  USING (public.adae_can_access_tesouraria(auth.uid()));

DROP POLICY IF EXISTS "Treasury users can manage receipts" ON public.adae_treasury_receipts;
CREATE POLICY "Treasury users can manage receipts"
  ON public.adae_treasury_receipts
  FOR ALL
  USING (public.adae_can_access_tesouraria(auth.uid()))
  WITH CHECK (public.adae_can_access_tesouraria(auth.uid()));

CREATE OR REPLACE FUNCTION public.adae_treasury_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS adae_treasury_transactions_updated_at ON public.adae_treasury_transactions;
CREATE TRIGGER adae_treasury_transactions_updated_at
  BEFORE UPDATE ON public.adae_treasury_transactions
  FOR EACH ROW EXECUTE FUNCTION public.adae_treasury_transactions_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-treasury-receipts',
  'adae-treasury-receipts',
  true,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Treasury users can view receipts storage" ON storage.objects;
CREATE POLICY "Treasury users can view receipts storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'adae-treasury-receipts'
    AND public.adae_can_access_tesouraria(auth.uid())
  );

DROP POLICY IF EXISTS "Treasury users can upload receipts storage" ON storage.objects;
CREATE POLICY "Treasury users can upload receipts storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-treasury-receipts'
    AND public.adae_can_access_tesouraria(auth.uid())
  );

DROP POLICY IF EXISTS "Treasury users can delete receipts storage" ON storage.objects;
CREATE POLICY "Treasury users can delete receipts storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-treasury-receipts'
    AND public.adae_can_access_tesouraria(auth.uid())
  );
