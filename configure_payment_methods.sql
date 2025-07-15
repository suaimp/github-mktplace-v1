-- =================================================================
-- CONFIGURAÇÃO DE MÉTODOS DE PAGAMENTO - PAGAR.ME
-- =================================================================
-- Este arquivo contém comandos SQL para configurar os métodos de 
-- pagamento usando a integração com Pagar.me
-- =================================================================

-- 1. Verificar se a tabela pagarme_settings existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'pagarme_settings'
);

-- 2. Visualizar configurações atuais do Pagar.me
SELECT 
  pagarme_enabled,
  pagarme_test_mode,
  currency,
  payment_methods,
  antifraude_enabled,
  antifraude_min_amount,
  updated_at
FROM pagarme_settings 
ORDER BY updated_at DESC 
LIMIT 1;

-- 3. Configurar Pagar.me em modo de teste (já ativo por padrão)
UPDATE pagarme_settings 
SET 
  pagarme_enabled = true,  -- Já é true por padrão
  pagarme_test_mode = true,
  antifraude_enabled = true,
  antifraude_min_amount = 10.00,
  payment_methods = ARRAY['credit_card', 'pix', 'boleto'],
  updated_at = NOW()
WHERE id = (SELECT id FROM pagarme_settings ORDER BY created_at DESC LIMIT 1);

-- 4. Configurar chaves de API (EXECUTE APENAS APÓS OBTER AS CHAVES DO PAGAR.ME)
-- IMPORTANTE: Substitua pelos valores reais das suas chaves
/*
UPDATE pagarme_settings 
SET 
  pagarme_api_key = 'ak_test_SEU_API_KEY_AQUI',
  pagarme_encryption_key = 'ek_test_SEU_ENCRYPTION_KEY_AQUI',
  pagarme_webhook_secret = 'SEU_WEBHOOK_SECRET_AQUI',
  updated_at = NOW()
WHERE id = (SELECT id FROM pagarme_settings ORDER BY created_at DESC LIMIT 1);
*/

-- 5. Configuração para PRODUÇÃO (USE APENAS QUANDO ESTIVER PRONTO)
-- ATENÇÃO: No ambiente de produção, USE CHAVES REAIS!
/*
UPDATE pagarme_settings 
SET 
  pagarme_test_mode = false,
  pagarme_api_key = 'ak_live_SEU_API_KEY_DE_PRODUCAO',
  pagarme_encryption_key = 'ek_live_SEU_ENCRYPTION_KEY_DE_PRODUCAO',
  updated_at = NOW()
WHERE id = (SELECT id FROM pagarme_settings ORDER BY created_at DESC LIMIT 1);
*/

-- 6. Desabilitar temporariamente o Pagar.me (se necessário)
/*
UPDATE pagarme_settings 
SET 
  pagarme_enabled = false,
  updated_at = NOW()
WHERE id = (SELECT id FROM pagarme_settings ORDER BY created_at DESC LIMIT 1);
*/

-- 7. Configurar valor mínimo do antifraude para evitar bloqueios
-- Valores muito baixos (ex: R$ 1,00) são frequentemente bloqueados
UPDATE pagarme_settings 
SET 
  antifraude_min_amount = 15.00,  -- Mínimo de R$ 15,00 recomendado
  updated_at = NOW()
WHERE id = (SELECT id FROM pagarme_settings ORDER BY created_at DESC LIMIT 1);

-- =================================================================
-- DICAS IMPORTANTES PARA EVITAR BLOQUEIO DO ANTIFRAUDE:
-- =================================================================
-- 1. Use valores acima de R$ 10,00 (recomendado R$ 15,00+)
-- 2. Preencha TODOS os dados obrigatórios:
--    - Nome completo do portador do cartão
--    - CPF válido
--    - Email válido
--    - Endereço completo
--    - Telefone
-- 3. Use dados consistentes (nome no cartão = nome do cliente)
-- 4. Evite múltiplas tentativas seguidas com o mesmo cartão
-- 5. No modo de teste, use os cartões oficiais do Pagar.me
-- =================================================================

-- 8. Query para monitorar transações bloqueadas
-- (Esta query funcionará quando você implementar o log de transações)
/*
SELECT 
  transaction_id,
  amount,
  status,
  error_message,
  created_at
FROM payment_transactions 
WHERE status = 'refused' 
  AND error_message ILIKE '%antifraude%'
ORDER BY created_at DESC 
LIMIT 10;
*/