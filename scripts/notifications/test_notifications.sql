-- Script de teste para criar uma notificação de exemplo
-- Execute este script no SQL Editor do Supabase Studio

-- Primeiro, vamos verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('notification_types', 'notifications');

-- Inserir uma notificação de teste (substitua o user_id por um ID válido)
INSERT INTO notifications (
  user_id,
  notification_type_id,
  title,
  message,
  metadata,
  is_read
) VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Pega o primeiro usuário disponível
  (SELECT id FROM notification_types WHERE type = 'chat' LIMIT 1),
  'Nova mensagem no chat',
  'Você recebeu uma nova mensagem de teste',
  jsonb_build_object(
    'sender_name', 'Sistema de Teste',
    'order_id', '123',
    'chat_id', '456'
  ),
  false
);

-- Verificar se a notificação foi criada
SELECT 
  n.id,
  n.title,
  n.message,
  n.is_read,
  n.created_at,
  nt.type as notification_type,
  u.email as user_email
FROM notifications n
JOIN notification_types nt ON n.notification_type_id = nt.id
JOIN auth.users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 5;
