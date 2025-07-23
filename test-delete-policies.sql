-- Script SQL para testar exclusão diretamente no Supabase
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar se há políticas de DELETE nas tabelas orders e order_items
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items') 
AND cmd = 'DELETE';

-- 2. Verificar se RLS está habilitado nas tabelas
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items');

-- 3. Verificar um pedido específico e tentar excluí-lo
-- (Substitua 'ORDER_ID_AQUI' por um ID real de pedido)
/*
-- Ver o pedido
SELECT * FROM orders WHERE id = 'ORDER_ID_AQUI';

-- Ver items do pedido
SELECT * FROM order_items WHERE order_id = 'ORDER_ID_AQUI';

-- Tentar excluir items (deve funcionar primeiro por causa da foreign key)
DELETE FROM order_items WHERE order_id = 'ORDER_ID_AQUI';

-- Tentar excluir o pedido
DELETE FROM orders WHERE id = 'ORDER_ID_AQUI';
*/
