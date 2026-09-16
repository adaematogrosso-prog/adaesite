-- Secretaria Estadual: atas, eventos, planos e inscrições
-- Execute no SQL Editor do projeto Supabase

CREATE OR REPLACE FUNCTION public.adae_can_access_secretaria(check_user_id uuid)
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

REVOKE ALL ON FUNCTION public.adae_can_access_secretaria(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adae_can_access_secretaria(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS public.adae_meeting_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adae_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  event_starts_at TIMESTAMPTZ NOT NULL,
  event_ends_at TIMESTAMPTZ,
  location TEXT,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adae_event_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.adae_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
  includes_accommodation BOOLEAN NOT NULL DEFAULT false,
  includes_kit BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adae_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.adae_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  member_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  t_shirt_size TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'cancelled')),
  total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents > 0),
  pix_reference TEXT NOT NULL,
  admin_notes TEXT,
  confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.adae_event_registration_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.adae_event_registrations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.adae_event_plans(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents BIGINT NOT NULL CHECK (line_total_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS adae_meeting_minutes_published_idx
  ON public.adae_meeting_minutes (is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS adae_events_published_idx
  ON public.adae_events (is_published, event_starts_at DESC);

CREATE INDEX IF NOT EXISTS adae_event_plans_event_idx
  ON public.adae_event_plans (event_id, display_order);

CREATE INDEX IF NOT EXISTS adae_event_registrations_event_idx
  ON public.adae_event_registrations (event_id, created_at DESC);

ALTER TABLE public.adae_meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_event_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adae_event_registration_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published meeting minutes" ON public.adae_meeting_minutes;
CREATE POLICY "Anyone can view published meeting minutes"
  ON public.adae_meeting_minutes
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Secretaria can manage meeting minutes" ON public.adae_meeting_minutes;
CREATE POLICY "Secretaria can manage meeting minutes"
  ON public.adae_meeting_minutes
  FOR ALL
  USING (public.adae_can_access_secretaria(auth.uid()))
  WITH CHECK (public.adae_can_access_secretaria(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view published events" ON public.adae_events;
CREATE POLICY "Anyone can view published events"
  ON public.adae_events
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Secretaria can manage events" ON public.adae_events;
CREATE POLICY "Secretaria can manage events"
  ON public.adae_events
  FOR ALL
  USING (public.adae_can_access_secretaria(auth.uid()))
  WITH CHECK (public.adae_can_access_secretaria(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view active event plans" ON public.adae_event_plans;
CREATE POLICY "Anyone can view active event plans"
  ON public.adae_event_plans
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.adae_events e
      WHERE e.id = event_id AND e.is_published = true
    )
  );

DROP POLICY IF EXISTS "Secretaria can manage event plans" ON public.adae_event_plans;
CREATE POLICY "Secretaria can manage event plans"
  ON public.adae_event_plans
  FOR ALL
  USING (public.adae_can_access_secretaria(auth.uid()))
  WITH CHECK (public.adae_can_access_secretaria(auth.uid()));

DROP POLICY IF EXISTS "Users can view own event registrations" ON public.adae_event_registrations;
CREATE POLICY "Users can view own event registrations"
  ON public.adae_event_registrations
  FOR SELECT
  USING (auth.uid() = user_id OR public.adae_can_access_secretaria(auth.uid()));

DROP POLICY IF EXISTS "Approved members can create event registrations" ON public.adae_event_registrations;
CREATE POLICY "Approved members can create event registrations"
  ON public.adae_event_registrations
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.adae_member_profiles
      WHERE user_id = auth.uid() AND status = 'approved'
    )
    AND EXISTS (
      SELECT 1 FROM public.adae_events e
      WHERE e.id = event_id
        AND e.is_published = true
        AND e.registration_open = true
    )
  );

DROP POLICY IF EXISTS "Secretaria can update event registrations" ON public.adae_event_registrations;
CREATE POLICY "Secretaria can update event registrations"
  ON public.adae_event_registrations
  FOR UPDATE
  USING (public.adae_can_access_secretaria(auth.uid()))
  WITH CHECK (public.adae_can_access_secretaria(auth.uid()));

DROP POLICY IF EXISTS "Users can view own registration items" ON public.adae_event_registration_items;
CREATE POLICY "Users can view own registration items"
  ON public.adae_event_registration_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.adae_event_registrations r
      WHERE r.id = registration_id
        AND (
          r.user_id = auth.uid()
          OR public.adae_can_access_secretaria(auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Users can insert own registration items" ON public.adae_event_registration_items;
CREATE POLICY "Users can insert own registration items"
  ON public.adae_event_registration_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.adae_event_registrations r
      WHERE r.id = registration_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Secretaria can manage registration items" ON public.adae_event_registration_items;
CREATE POLICY "Secretaria can manage registration items"
  ON public.adae_event_registration_items
  FOR ALL
  USING (public.adae_can_access_secretaria(auth.uid()))
  WITH CHECK (public.adae_can_access_secretaria(auth.uid()));

CREATE OR REPLACE FUNCTION public.adae_secretaria_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS adae_meeting_minutes_updated_at ON public.adae_meeting_minutes;
CREATE TRIGGER adae_meeting_minutes_updated_at
  BEFORE UPDATE ON public.adae_meeting_minutes
  FOR EACH ROW EXECUTE FUNCTION public.adae_secretaria_updated_at();

DROP TRIGGER IF EXISTS adae_events_updated_at ON public.adae_events;
CREATE TRIGGER adae_events_updated_at
  BEFORE UPDATE ON public.adae_events
  FOR EACH ROW EXECUTE FUNCTION public.adae_secretaria_updated_at();

DROP TRIGGER IF EXISTS adae_event_plans_updated_at ON public.adae_event_plans;
CREATE TRIGGER adae_event_plans_updated_at
  BEFORE UPDATE ON public.adae_event_plans
  FOR EACH ROW EXECUTE FUNCTION public.adae_secretaria_updated_at();

DROP TRIGGER IF EXISTS adae_event_registrations_updated_at ON public.adae_event_registrations;
CREATE TRIGGER adae_event_registrations_updated_at
  BEFORE UPDATE ON public.adae_event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.adae_secretaria_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-secretaria-minutes',
  'adae-secretaria-minutes',
  true,
  15728640,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'adae-secretaria-events',
  'adae-secretaria-events',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view secretaria minute files" ON storage.objects;
CREATE POLICY "Anyone can view secretaria minute files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'adae-secretaria-minutes');

DROP POLICY IF EXISTS "Secretaria can upload minute files" ON storage.objects;
CREATE POLICY "Secretaria can upload minute files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-secretaria-minutes'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Secretaria can update minute files" ON storage.objects;
CREATE POLICY "Secretaria can update minute files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-secretaria-minutes'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Secretaria can delete minute files" ON storage.objects;
CREATE POLICY "Secretaria can delete minute files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-secretaria-minutes'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can view secretaria event images" ON storage.objects;
CREATE POLICY "Anyone can view secretaria event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'adae-secretaria-events');

DROP POLICY IF EXISTS "Secretaria can upload event images" ON storage.objects;
CREATE POLICY "Secretaria can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'adae-secretaria-events'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Secretaria can update event images" ON storage.objects;
CREATE POLICY "Secretaria can update event images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'adae-secretaria-events'
    AND public.adae_can_access_secretaria(auth.uid())
  );

DROP POLICY IF EXISTS "Secretaria can delete event images" ON storage.objects;
CREATE POLICY "Secretaria can delete event images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'adae-secretaria-events'
    AND public.adae_can_access_secretaria(auth.uid())
  );
