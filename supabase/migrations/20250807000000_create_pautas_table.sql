-- Criação da tabela de pautas para artigos
-- Esta tabela armazena informações sobre pautas enviadas pelos usuários para criação de artigos

CREATE TABLE IF NOT EXISTS pautas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    palavra_chave TEXT NOT NULL,
    url_site TEXT NOT NULL,
    texto_ancora TEXT NOT NULL,
    requisitos_especiais TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que cada item pode ter apenas uma pauta
    UNIQUE(item_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pautas_item_id ON pautas(item_id);
CREATE INDEX IF NOT EXISTS idx_pautas_created_at ON pautas(created_at);

-- RLS (Row Level Security) - usuários só podem ver pautas dos seus próprios pedidos
ALTER TABLE pautas ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas pautas dos seus próprios itens
CREATE POLICY pautas_user_policy ON pautas
    FOR ALL
    USING (
        item_id IN (
            SELECT oi.id 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.id 
            WHERE o.user_id = auth.uid()
        )
    );

-- Política para administradores verem todas as pautas
CREATE POLICY pautas_admin_policy ON pautas
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = true
        )
    );

-- Comentários para documentação
COMMENT ON TABLE pautas IS 'Armazena pautas enviadas pelos usuários para criação de artigos';
COMMENT ON COLUMN pautas.id IS 'Identificador único da pauta';
COMMENT ON COLUMN pautas.item_id IS 'Referência ao item do pedido';
COMMENT ON COLUMN pautas.palavra_chave IS 'Palavra-chave alvo para o artigo';
COMMENT ON COLUMN pautas.url_site IS 'URL que deve ser incluída no conteúdo';
COMMENT ON COLUMN pautas.texto_ancora IS 'Texto âncora para o link no conteúdo';
COMMENT ON COLUMN pautas.requisitos_especiais IS 'Requisitos adicionais para criação do artigo';
COMMENT ON COLUMN pautas.created_at IS 'Data de criação da pauta';
COMMENT ON COLUMN pautas.updated_at IS 'Data da última atualização da pauta';
