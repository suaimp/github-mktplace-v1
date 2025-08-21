-- Criação de índices para a tabela notifications
-- Parte 2: Otimização de performance

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_notifications_customer_type_created 
ON notifications(customer_id, type, created_at DESC);
