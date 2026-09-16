-- Limpa dados manuais da diretoria e reinicia vínculos
-- Execute no SQL Editor do projeto avpbrlhofxgonaliagvs
-- Mantém os 8 cargos fixos; nome/foto passam a vir só dos perfis vinculados

UPDATE public.adae_executive_members
SET
  name = '',
  photo_url = NULL,
  linked_user_id = NULL;
