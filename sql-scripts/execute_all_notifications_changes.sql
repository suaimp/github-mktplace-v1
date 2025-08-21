-- Script principal para executar todas as alterações de notificações
-- Execute este arquivo no Supabase Studio ou via cliente SQL

\echo '🚀 Iniciando reestruturação completa da tabela notifications...'

-- Parte 1: Alterações estruturais
\echo '📝 Executando alterações estruturais...'
\i sql-scripts/notifications/01_alter_table_structure.sql

-- Parte 2: Criação de índices
\echo '🔍 Criando índices de performance...'
\i sql-scripts/indexes/notifications_indexes.sql

-- Parte 3A: Remoção de policies antigas
\echo '🧹 Removendo policies antigas...'
\i sql-scripts/policies/01_remove_old_policies.sql

-- Parte 3B: Criação de novas policies
\echo '🔒 Criando novas policies de segurança...'
\i sql-scripts/policies/02_create_new_policies.sql

\echo '✅ Reestruturação da tabela notifications concluída com sucesso!'
\echo '📊 Estrutura final:'
\echo '   - sender_id: ID do usuário que enviou a mensagem'
\echo '   - customer_id: ID do cliente/comprador do pedido'
\echo '   - Políticas RLS atualizadas'
\echo '   - Índices de performance criados'
