-- Exibição pública da diretoria + sincronização de foto no vínculo
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs

DROP POLICY IF EXISTS "Public can view executive linked profiles" ON public.adae_member_profiles;
CREATE POLICY "Public can view executive linked profiles"
  ON public.adae_member_profiles
  FOR SELECT
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.adae_executive_members em
      WHERE em.linked_user_id = adae_member_profiles.user_id
        AND em.is_active = true
    )
  );

CREATE OR REPLACE FUNCTION public.adae_link_executive_member(
  p_executive_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.adae_member_profiles%ROWTYPE;
BEGIN
  IF NOT public.adae_can_approve_memberships(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para gerenciar a diretoria.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.adae_executive_members
    WHERE id = p_executive_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Cargo da diretoria não encontrado.';
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_profile
    FROM public.adae_member_profiles
    WHERE user_id = p_user_id AND status = 'approved';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Membro aprovado não encontrado.';
    END IF;

    UPDATE public.adae_executive_members
    SET linked_user_id = NULL
    WHERE linked_user_id = p_user_id
      AND id <> p_executive_id;

    UPDATE public.adae_executive_members
    SET
      linked_user_id = p_user_id,
      name = v_profile.full_name,
      photo_url = v_profile.profile_photo_url
    WHERE id = p_executive_id;
  ELSE
    UPDATE public.adae_executive_members
    SET linked_user_id = NULL
    WHERE id = p_executive_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.adae_link_executive_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adae_link_executive_member(uuid, uuid) TO authenticated;
