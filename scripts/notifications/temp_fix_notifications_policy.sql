-- Remover a política restritiva de INSERT
DROP POLICY IF EXISTS "notifications_insert_own" ON "public"."notifications";

-- Criar nova política mais permissiva para INSERT
-- Permite que usuários autenticados criem notificações para qualquer usuário
CREATE POLICY "notifications_insert_authenticated" ON "public"."notifications"
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Manter as outras políticas como estão (SELECT, UPDATE, DELETE ainda são restritas ao próprio usuário)
