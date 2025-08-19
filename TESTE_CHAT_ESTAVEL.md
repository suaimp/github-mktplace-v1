# 🔧 SCRIPT DE TESTE - CHAT ESTÁVEL

## 📋 Verificações Rápidas

### 1. Verificar se Supabase está rodando
npx supabase status

### 2. Verificar tabelas de chat
npx supabase sql --local "
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('order_chat', 'orders', 'order_items')
ORDER BY table_name, ordinal_position;
"

### 3. Verificar dados de teste
npx supabase sql --local "
SELECT 
  COUNT(*) as total_orders,
  (SELECT COUNT(*) FROM order_items) as total_items,
  (SELECT COUNT(*) FROM order_chat) as total_messages
FROM orders;
"

### 4. Inserir dados de teste se necessário
npx supabase sql --local "
-- Inserir order de teste se não existir
INSERT INTO orders (
  id, user_id, total_amount, status, payment_method, payment_status,
  billing_name, billing_email, billing_address, billing_city, 
  billing_state, billing_zip_code, billing_document_number
) 
VALUES (
  'test-order-id-123', 
  (SELECT id FROM auth.users LIMIT 1),
  100.00, 'completed', 'credit_card', 'paid',
  'Cliente Teste', 'teste@exemplo.com', 'Rua Teste 123', 
  'São Paulo', 'SP', '01234-567', '12345678901'
) ON CONFLICT (id) DO NOTHING;

-- Inserir order_item de teste
INSERT INTO order_items (
  id, order_id, product_name, product_url, quantity, unit_price, total_price
)
VALUES (
  'test-item-id-123',
  'test-order-id-123',
  'Produto de Teste Chat',
  'https://exemplo.com/produto',
  1, 100.00, 100.00
) ON CONFLICT (id) DO NOTHING;

-- Inserir algumas mensagens de teste
INSERT INTO order_chat (
  order_id, order_item_id, entry_id, sender_id, sender_type, message
)
VALUES 
  ('test-order-id-123', 'test-item-id-123', 'test-entry-123', 
   (SELECT id FROM auth.users LIMIT 1), 'user', 'Olá, preciso de ajuda!'),
  ('test-order-id-123', 'test-item-id-123', 'test-entry-123', 
   (SELECT id FROM admins LIMIT 1), 'admin', 'Olá! Como posso ajudar?')
ON CONFLICT (id) DO NOTHING;
"

### 5. Verificar RLS policies
npx supabase sql --local "
SELECT 
  schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'order_chat';
"

## 🚀 Próximos Passos

### 1. Iniciar o servidor de desenvolvimento
npm run dev

### 2. Testar no navegador
- Abrir localhost:3000
- Ir para página de Orders
- Abrir um chat
- Enviar mensagens
- Verificar se reconecta automaticamente

### 3. Monitorar logs
- Abrir DevTools (F12)
- Aba Console
- Procurar por logs do chat: 🔄, ✅, ❌

### 4. Testar cenários de falha
- Desconectar internet
- Reconectar
- Verificar se mensagens são sincronizadas
- Fechar e abrir modal várias vezes

## 🐛 DEBUG - Possíveis Problemas

### Problema: "Falha ao carregar mensagens"
**Solução**: Verificar se tabelas existem e RLS está configurado

### Problema: "Conexão em tempo real indisponível"
**Solução**: Verificar se Supabase realtime está ativo

### Problema: Mensagens duplicadas
**Solução**: Verificar lógica de deduplicação no useChatStable

### Problema: Chat não reconecta
**Solução**: Verificar logs de reconexão e timeouts

## 📊 Métricas de Performance

### Tempo esperado de carregamento:
- Mensagens: < 1 segundo
- Conexão realtime: < 2 segundos
- Reconexão: < 5 segundos

### Indicadores de sucesso:
- ✅ "Mensagens carregadas: X" no console
- ✅ "Realtime conectado" no console
- ✅ Mensagens aparecem instantaneamente

### Indicadores de problema:
- ❌ "Erro ao carregar mensagens" no console
- ❌ "Conexão perdida, tentando reconectar" frequente
- ❌ Mensagens não aparecem após envio
