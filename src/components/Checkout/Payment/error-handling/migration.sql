-- Migração para tabela de logs de erros de pagamento
-- Esta tabela armazena erros do PagarMe para análise e debugging

-- Criar tabela de logs de erro de pagamento
CREATE TABLE IF NOT EXISTS payment_error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    error_type VARCHAR(20) NOT NULL CHECK (error_type IN ('validation', 'card', 'system', 'unknown')),
    error_message TEXT NOT NULL,
    original_error TEXT,
    action_required VARCHAR(30) CHECK (action_required IN ('check_card_data', 'try_different_card', 'try_again_later', 'contact_support')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('credit_card', 'pix', 'boleto')),
    component VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_error_logs_created_at ON payment_error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_error_logs_error_type ON payment_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_payment_error_logs_severity ON payment_error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_payment_error_logs_payment_method ON payment_error_logs(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_error_logs_user_id ON payment_error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_error_logs_order_id ON payment_error_logs(order_id);

-- RLS (Row Level Security)
ALTER TABLE payment_error_logs ENABLE ROW LEVEL SECURITY;

-- Política para inserção (qualquer usuário autenticado pode inserir logs)
CREATE POLICY "Users can insert payment error logs" ON payment_error_logs
    FOR INSERT WITH CHECK (true);

-- Política para leitura (apenas admins podem ver logs)
CREATE POLICY "Only admins can view payment error logs" ON payment_error_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%@admin.%'
        )
    );

-- Comentários na tabela
COMMENT ON TABLE payment_error_logs IS 'Logs de erros de pagamento do PagarMe para análise e debugging';
COMMENT ON COLUMN payment_error_logs.error_type IS 'Tipo do erro: validation, card, system, unknown';
COMMENT ON COLUMN payment_error_logs.error_message IS 'Mensagem traduzida e amigável do erro';
COMMENT ON COLUMN payment_error_logs.original_error IS 'Mensagem original do erro do PagarMe';
COMMENT ON COLUMN payment_error_logs.action_required IS 'Ação sugerida para resolver o erro';
COMMENT ON COLUMN payment_error_logs.payment_method IS 'Método de pagamento usado';
COMMENT ON COLUMN payment_error_logs.component IS 'Componente onde ocorreu o erro';
COMMENT ON COLUMN payment_error_logs.action IS 'Ação que causou o erro';
COMMENT ON COLUMN payment_error_logs.severity IS 'Severidade do erro';
COMMENT ON COLUMN payment_error_logs.user_agent IS 'User agent do navegador para debugging';
