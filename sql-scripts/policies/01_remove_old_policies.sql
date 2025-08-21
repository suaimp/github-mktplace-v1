-- Remoção de policies antigas da tabela notifications
-- Parte 3A: Limpeza de policies

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem ver suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem criar notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar suas notificações" ON notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar suas notificações" ON notifications;

-- Remover policies em inglês também, caso existam
DROP POLICY IF EXISTS "Authenticated users can read notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can delete notifications" ON notifications;
