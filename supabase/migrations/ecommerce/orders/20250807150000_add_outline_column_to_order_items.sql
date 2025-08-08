-- Adiciona coluna outline (pauta) à tabela order_items
-- Esta coluna armazena dados JSON da pauta enviada pelo usuário para criação de artigos

-- Adicionar a coluna outline como JSONB para melhor performance e validação
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS outline JSONB;

-- Adicionar comentário para documentação
COMMENT ON COLUMN order_items.outline IS 'JSON data containing article outline information (palavra-chave, url_site, texto_ancora, requisitos_especiais)';

-- Criar índice para consultas eficientes no JSON
CREATE INDEX IF NOT EXISTS idx_order_items_outline ON order_items USING GIN (outline);

-- Criar índice para verificar se existe outline
CREATE INDEX IF NOT EXISTS idx_order_items_has_outline ON order_items ((outline IS NOT NULL));
