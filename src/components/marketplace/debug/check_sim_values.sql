-- SQL para verificar valores do campo "Artigo é patrocinado"
-- Este script vai nos mostrar todos os valores únicos para esse campo

-- Primeiro, vamos encontrar o ID do campo
SELECT 
    id,
    label,
    field_type
FROM form_fields 
WHERE LOWER(label) LIKE '%patrocinado%' 
   OR LOWER(label) LIKE '%sponsored%';

-- Depois, vamos ver todos os valores únicos para esse campo
-- Substitua FIELD_ID_AQUI pelo ID encontrado acima
SELECT 
    fev.value,
    COUNT(*) as count_occurrences
FROM form_entry_values fev
JOIN form_fields ff ON fev.field_id = ff.id
WHERE LOWER(ff.label) LIKE '%patrocinado%'
GROUP BY fev.value
ORDER BY count_occurrences DESC;

-- Vamos também verificar se há entradas com status 'verificado' que tenham "Sim"
SELECT 
    fe.id,
    fe.status,
    fev.value,
    ff.label
FROM form_entries fe
JOIN form_entry_values fev ON fe.id = fev.entry_id
JOIN form_fields ff ON fev.field_id = ff.id
WHERE LOWER(ff.label) LIKE '%patrocinado%'
  AND fev.value = 'Sim'
  AND fe.status = 'verificado'
LIMIT 10;
