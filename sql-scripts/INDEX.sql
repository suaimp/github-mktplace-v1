-- ==========================================
-- ÍNDICE DE SCRIPTS SQL DISPONÍVEIS
-- ==========================================

-- 🚀 EXECUÇÃO RÁPIDA (RECOMENDADO)
-- Execute na raiz do projeto:
-- Arquivo: execute_migration_studio_clean.sql
-- URL Studio: http://localhost:54323

-- 📁 SCRIPTS ORGANIZADOS POR CATEGORIA

-- 1. MIGRATIONS (por data)
-- sql-scripts/migrations/20250821154721_create_notifications_table.sql
-- sql-scripts/migrations/20250821160000_fix_notifications_rls_policy.sql  
-- sql-scripts/migrations/20250821170000_restructure_notifications_table.sql

-- 2. NOTIFICATIONS (estrutura da tabela)
-- sql-scripts/notifications/01_alter_table_structure.sql
-- sql-scripts/notifications/migration_notifications_restructure.sql

-- 3. POLICIES (segurança RLS)
-- sql-scripts/policies/01_remove_old_policies.sql
-- sql-scripts/policies/02_create_new_policies.sql

-- 4. INDEXES (performance)
-- sql-scripts/indexes/notifications_indexes.sql

-- 5. SCRIPTS EXECUTORES
-- sql-scripts/execute_all_notifications_changes.sql (modular)

-- ==========================================
-- RECOMENDAÇÃO: Use execute_migration_studio_clean.sql
-- Localização: pasta raiz do projeto
-- ==========================================
