-- Verificar se a tabela notifications existe e sua estrutura
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Se não retornar nada, verificar se existe com outro nome
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%notification%' 
  AND table_schema = 'public';
