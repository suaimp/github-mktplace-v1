-- Reativar RLS com política corrigida
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "notifications_select_own" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_update_own" ON "public"."notifications";
DROP POLICY IF EXISTS "notifications_delete_own" ON "public"."notifications";

-- Política para SELECT: usuários podem ver todas as notificações (ou ajustar conforme necessário)
CREATE POLICY "notifications_select_all" ON "public"."notifications"
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: usuários podem criar notificações
CREATE POLICY "notifications_insert_own" ON "public"."notifications"
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar qualquer notificação (para marcar como lida)
CREATE POLICY "notifications_update_all" ON "public"."notifications"
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE: usuários podem deletar qualquer notificação
CREATE POLICY "notifications_delete_all" ON "public"."notifications"
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (true);
