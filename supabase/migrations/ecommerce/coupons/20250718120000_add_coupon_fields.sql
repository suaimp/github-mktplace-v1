/*
  # Add new fields to coupons table

  1. New Columns
    - `maximum_amount`: Valor máximo para uso do cupom
    - `individual_use_only`: Apenas uso individual (não pode ser usado com outros cupons)
    - `exclude_sale_items`: Excluir itens em oferta
    - `usage_limit_per_customer`: Limite de uso por cliente

  2. Update discount_type enum
    - Remove 'fixed' option
    - Add 'cart_fixed' and 'product_fixed' options
    - Keep 'percentage' option
*/

-- Add new columns to coupons table
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS maximum_amount decimal(10,2),
ADD COLUMN IF NOT EXISTS individual_use_only boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS exclude_sale_items boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_limit_per_customer integer;

-- Add constraint for usage_limit_per_customer
ALTER TABLE coupons 
ADD CONSTRAINT check_usage_limit_per_customer 
CHECK (usage_limit_per_customer IS NULL OR usage_limit_per_customer > 0);

-- FIRST: Drop all check constraints on discount_type BEFORE updating data
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'coupons'::regclass 
        AND contype = 'c' 
        AND pg_get_constraintdef(oid) LIKE '%discount_type%'
    ) LOOP
        EXECUTE 'ALTER TABLE coupons DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- THEN: Update existing data to use new discount types
-- Convert 'fixed' to 'cart_fixed' 
UPDATE coupons SET discount_type = 'cart_fixed' WHERE discount_type = 'fixed';

-- FINALLY: Add the new constraint with updated values
ALTER TABLE coupons 
ADD CONSTRAINT coupons_discount_type_check 
CHECK (discount_type IN ('percentage', 'cart_fixed', 'product_fixed'));

-- Update the percentage validation constraint
ALTER TABLE coupons 
DROP CONSTRAINT IF EXISTS valid_percentage;

ALTER TABLE coupons 
ADD CONSTRAINT valid_percentage CHECK (
  discount_type != 'percentage' OR 
  (discount_value >= 0 AND discount_value <= 100)
);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_coupons_individual_use ON coupons(individual_use_only);
CREATE INDEX IF NOT EXISTS idx_coupons_exclude_sale_items ON coupons(exclude_sale_items);

-- Add comments for better documentation
COMMENT ON COLUMN coupons.maximum_amount IS 'Valor máximo que pode ser aplicado no pedido para usar este cupom';
COMMENT ON COLUMN coupons.individual_use_only IS 'Indica se o cupom não pode ser usado junto com outros cupons';
COMMENT ON COLUMN coupons.exclude_sale_items IS 'Indica se o cupom não é válido para produtos em promoção';
COMMENT ON COLUMN coupons.usage_limit_per_customer IS 'Limite de vezes que um cliente pode usar este cupom';
