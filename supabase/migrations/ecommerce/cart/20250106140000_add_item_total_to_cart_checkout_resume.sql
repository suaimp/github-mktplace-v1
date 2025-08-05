-- Adiciona a coluna 'item_total' para armazenar o valor total do item na tabela de resumo do checkout
ALTER TABLE cart_checkout_resume
ADD COLUMN item_total numeric DEFAULT 0; 