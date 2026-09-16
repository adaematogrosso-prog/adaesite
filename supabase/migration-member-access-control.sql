-- Controle de acesso: bloqueio manual e lockout por tentativas de login
-- Execute no SQL Editor do Supabase

ALTER TABLE public.adae_member_profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS block_reason TEXT;

CREATE TABLE IF NOT EXISTS public.adae_login_security (
  login_email TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_at TIMESTAMPTZ,
  unlock_token_hash TEXT,
  unlock_token_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.adae_login_security ENABLE ROW LEVEL SECURITY;

-- Apenas service role / server actions (sem policies para authenticated)

CREATE INDEX IF NOT EXISTS adae_member_profiles_is_blocked_idx
  ON public.adae_member_profiles (is_blocked)
  WHERE is_blocked = true;

CREATE INDEX IF NOT EXISTS adae_login_security_user_id_idx
  ON public.adae_login_security (user_id);
