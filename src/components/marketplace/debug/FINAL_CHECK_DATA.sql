-- Script para verificar dados do campo "Artigo é patrocinado"
-- Executar no seu cliente SQL (Supabase Dashboard, pgAdmin, etc.)

-- 1. Verificar o campo patrocinado
SELECT 
    ff.id,
    ff.label,
    ff.field_type,
    COUNT(fev.id) as total_values
FROM form_fields ff
LEFT JOIN form_entry_values fev ON ff.id = fev.field_id
WHERE LOWER(ff.label) LIKE '%patrocinado%'
GROUP BY ff.id, ff.label, ff.field_type;

-- 2. Ver distribuição de valores
SELECT 
    fev.value,
    COUNT(*) as count_total,
    COUNT(CASE WHEN fe.status = 'verificado' THEN 1 END) as count_verified
FROM form_entry_values fev
JOIN form_fields ff ON fev.field_id = ff.id
JOIN form_entries fe ON fev.entry_id = fe.id
WHERE LOWER(ff.label) LIKE '%patrocinado%'
GROUP BY fev.value
ORDER BY count_total DESC;

-- 3. Verificar especificamente valores "Sim" verificados
SELECT COUNT(*) as sim_verified_count
FROM form_entry_values fev
JOIN form_fields ff ON fev.field_id = ff.id
JOIN form_entries fe ON fev.entry_id = fe.id
WHERE LOWER(ff.label) LIKE '%patrocinado%'
  AND fev.value = 'Sim'
  AND fe.status = 'verificado';

-- 4. Exemplos de entradas verificadas
SELECT 
    fe.id,
    fe.status,
    fev.value,
    ff.label,
    fe.created_at
FROM form_entries fe
JOIN form_entry_values fev ON fe.id = fev.entry_id
JOIN form_fields ff ON fev.field_id = ff.id
WHERE LOWER(ff.label) LIKE '%patrocinado%'
  AND fe.status = 'verificado'
ORDER BY fe.created_at DESC
LIMIT 10;
