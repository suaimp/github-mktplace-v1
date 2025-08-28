-- Script para ocultar a opção "Podcasts" da sidebar
-- Execute este SQL no seu banco de dados Supabase

UPDATE menu_items 
SET is_visible = false 
WHERE id = '60445b77-a7da-46a2-a420-eabe612ec76e' 
  AND name = 'Podcasts';

-- Para verificar se foi aplicado:
SELECT id, name, is_visible 
FROM menu_items 
WHERE name = 'Podcasts';
