-- =================================================================
-- CONFIGURAÇÃO SEGURA DO PAGAR.ME COM SUPABASE SECRETS
-- =================================================================

-- 1. Criar secrets para as chaves do Pagar.me (EXECUTE NO SUPABASE SQL EDITOR)

-- Chaves de TESTE
SELECT vault.create_secret(
  'pagarme_api_key_test', 
  'ak_test_SEU_API_KEY_DE_TESTE_AQUI'
);

SELECT vault.create_secret(
  'pagarme_encryption_key_test', 
  'ek_test_SEU_ENCRYPTION_KEY_DE_TESTE_AQUI'
);

-- Chaves de PRODUÇÃO (USE APENAS QUANDO ESTIVER PRONTO)
SELECT vault.create_secret(
  'pagarme_api_key_live', 
  'ak_live_SEU_API_KEY_DE_PRODUCAO_AQUI'
);

SELECT vault.create_secret(
  'pagarme_encryption_key_live', 
  'ek_live_SEU_ENCRYPTION_KEY_DE_PRODUCAO_AQUI'
);

-- 2. Função para recuperar chaves de forma segura
CREATE OR REPLACE FUNCTION get_pagarme_keys(test_mode boolean DEFAULT true)
RETURNS TABLE(api_key text, encryption_key text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF test_mode THEN
    RETURN QUERY
    SELECT 
      vault.decrypted_secrets.decrypted_secret AS api_key,
      vault.decrypted_secrets.decrypted_secret AS encryption_key
    FROM vault.decrypted_secrets 
    WHERE vault.decrypted_secrets.name IN ('pagarme_api_key_test', 'pagarme_encryption_key_test');
  ELSE
    RETURN QUERY
    SELECT 
      vault.decrypted_secrets.decrypted_secret AS api_key,
      vault.decrypted_secrets.decrypted_secret AS encryption_key
    FROM vault.decrypted_secrets 
    WHERE vault.decrypted_secrets.name IN ('pagarme_api_key_live', 'pagarme_encryption_key_live');
  END IF;
END;
$$;

-- 3. Atualizar tabela para referenciar secrets ao invés de armazenar chaves
ALTER TABLE pagarme_settings 
DROP COLUMN IF EXISTS pagarme_api_key,
DROP COLUMN IF EXISTS pagarme_encryption_key;

-- Adicionar apenas referências e configurações
ALTER TABLE pagarme_settings 
ADD COLUMN use_vault_secrets BOOLEAN DEFAULT true,
ADD COLUMN webhook_secret TEXT; -- Webhook pode ficar na tabela (menos sensível)

-- 4. Verificar se secrets foram criados corretamente
SELECT name, created_at 
FROM vault.secrets 
WHERE name LIKE 'pagarme_%'
ORDER BY created_at DESC;

-- 5. Testar recuperação de chaves (teste)
SELECT * FROM get_pagarme_keys(true);

-- 6. Testar recuperação de chaves (produção) 
-- SELECT * FROM get_pagarme_keys(false);

-- =================================================================
-- INSTRUÇÕES:
-- =================================================================
-- 1. Execute os SELECTs vault.create_secret com suas chaves reais
-- 2. No frontend, remova os campos de API key e Encryption key
-- 3. Mantenha apenas: modo teste, métodos de pagamento, antifraude
-- 4. As chaves serão recuperadas automaticamente pela função
-- 5. Para Edge Functions, use: SELECT * FROM get_pagarme_keys(test_mode)
-- =================================================================
