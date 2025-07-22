-- Adicionar colunas para suporte a cupons na tabela order_totals

-- Adicionar coluna para ID do cupom aplicado
ALTER TABLE order_totals 
ADD COLUMN IF NOT EXISTS applied_coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;

-- Adicionar coluna para valor do desconto aplicado
ALTER TABLE order_totals 
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0 CHECK (discount_value >= 0);

-- Comentários para documentação
COMMENT ON COLUMN order_totals.applied_coupon_id IS 'ID do cupom aplicado no pedido';
COMMENT ON COLUMN order_totals.discount_value IS 'Valor do desconto aplicado ao pedido';

-- Índice para melhorar performance de consultas por cupom
CREATE INDEX IF NOT EXISTS idx_order_totals_applied_coupon_id 
ON order_totals (applied_coupon_id);
