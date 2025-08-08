-- Rollback: Remove coluna outline da tabela order_items
-- Esta migration reverte as mudanças da migration 20250807150000_add_outline_column_to_order_items.sql

-- Remover índices relacionados à coluna outline
DROP INDEX IF EXISTS idx_order_items_outline;
DROP INDEX IF EXISTS idx_order_items_has_outline;

-- Remover a coluna outline
ALTER TABLE order_items 
DROP COLUMN IF EXISTS outline;
