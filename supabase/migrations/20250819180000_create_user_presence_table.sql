-- Migração para criar tabela de presença de usuários
-- Responsabilidade: Gerenciar status online/offline dos usuários

-- Criar tabela user_presence
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'typing', 'idle')),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    online_at TIMESTAMPTZ,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_order_item_id ON user_presence(order_item_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

-- Índice composto para consultas por usuário e chat
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_presence_user_order_unique 
ON user_presence(user_id, COALESCE(order_item_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_presence_updated_at ON user_presence;
CREATE TRIGGER trigger_update_user_presence_updated_at
    BEFORE UPDATE ON user_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_user_presence_updated_at();

-- RLS (Row Level Security)
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam sua própria presença
CREATE POLICY "Users can view own presence" ON user_presence
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Política para permitir que usuários atualizem sua própria presença
CREATE POLICY "Users can update own presence" ON user_presence
    FOR ALL USING (
        auth.uid() = user_id
    );

-- Política para permitir que usuários vejam presença de outros no mesmo chat
CREATE POLICY "Users can view others presence in same chat" ON user_presence
    FOR SELECT USING (
        order_item_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM order_chat_participants ocp
            WHERE ocp.order_item_id = user_presence.order_item_id
            AND ocp.user_id = auth.uid()
        )
    );

-- Política para admins verem todas as presenças
CREATE POLICY "Admins can view all presence" ON user_presence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins a
            WHERE a.id = auth.uid()
        )
    );

-- Função para limpar presença antiga automaticamente
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
    UPDATE user_presence 
    SET status = 'offline', 
        updated_at = NOW()
    WHERE status != 'offline' 
    AND last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE user_presence IS 'Tabela para gerenciar presença online/offline dos usuários';
COMMENT ON COLUMN user_presence.user_id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN user_presence.status IS 'Status atual: online, offline, typing, idle';
COMMENT ON COLUMN user_presence.last_seen IS 'Último momento em que o usuário foi visto ativo';
COMMENT ON COLUMN user_presence.online_at IS 'Momento em que ficou online pela última vez';
COMMENT ON COLUMN user_presence.order_item_id IS 'Chat específico (opcional, para presença global use NULL)';
