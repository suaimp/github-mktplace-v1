-- Adicionar política para permitir que usuários autenticados leiam cupons ativos
-- para poder aplicá-los durante o checkout

-- Criar política para usuários autenticados lerem cupons ativos
CREATE POLICY "Users can read active coupons for validation" 
  ON coupons 
  FOR SELECT 
  TO authenticated 
  USING (is_active = true);

-- Comentário explicativo
COMMENT ON POLICY "Users can read active coupons for validation" ON coupons 
IS 'Permite que usuários autenticados leiam cupons ativos para validação durante o checkout';
