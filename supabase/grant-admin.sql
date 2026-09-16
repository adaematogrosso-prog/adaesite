-- Conceder admin a um usuário já cadastrado no Auth
-- Substitua o UUID pelo UID copiado em Authentication > Users

SELECT public.adae_grant_admin('5c0e0b1f-8cb2-4f19-bf34-03fd115b8c66');
