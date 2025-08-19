-- Inserir dados de teste para order_chat

-- Primeiro, vamos criar um usuário de teste
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'teste@exemplo.com',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Depois, vamos garantir que existem alguns orders e order_items para teste
INSERT INTO orders (
  id, 
  user_id, 
  total_amount, 
  status, 
  payment_method, 
  payment_status,
  billing_name,
  billing_email,
  billing_address,
  billing_city,
  billing_state,
  billing_zip_code,
  billing_document_number,
  created_at, 
  updated_at
) 
VALUES 
  (
    '123e4567-e89b-12d3-a456-426614174000', 
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
    100.00, 
    'pending', 
    'credit_card', 
    'pending',
    'João da Silva',
    'joao@exemplo.com',
    'Rua Teste, 123',
    'São Paulo',
    'SP',
    '01234-567',
    '123.456.789-00',
    NOW(), 
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_name, product_url, unit_price, total_price, created_at)
VALUES 
  ('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Produto Teste', 'https://exemplo.com/produto', 50.00, 50.00, NOW()),
  ('323e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Outro Produto', 'https://exemplo.com/outro', 50.00, 50.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir mensagens de chat de teste
INSERT INTO order_chat (id, order_id, order_item_id, entry_id, sender_id, sender_type, message, is_read, created_at, updated_at)
VALUES 
  -- Mensagens para o primeiro item
  ('333e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', '3e79308e-0726-4feb-80e3-9ca6ac4423c1', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'user', 'Olá! Tenho uma dúvida sobre este produto.', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  
  ('433e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', '3e79308e-0726-4feb-80e3-9ca6ac4423c1', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin', 'Olá! Como posso ajudá-lo?', true, NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 50 minutes'),
  
  ('533e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', '3e79308e-0726-4feb-80e3-9ca6ac4423c1', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'user', 'Gostaria de saber sobre o prazo de entrega.', true, NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 45 minutes'),
  
  ('633e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', '3e79308e-0726-4feb-80e3-9ca6ac4423c1', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin', 'O prazo de entrega é de 5 a 7 dias úteis.', false, NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 30 minutes'),
  
  -- Mensagens para o segundo item
  ('733e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174000', '3e79308e-0726-4feb-80e3-9ca6ac4423c2', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'user', 'Este produto tem garantia?', true, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
  
  ('833e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174000', '3e79308e-0726-4feb-80e3-9ca6ac4423c2', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin', 'Sim! Tem garantia de 12 meses.', false, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes')
ON CONFLICT (id) DO NOTHING;

-- Comentário para verificação
SELECT 'Dados de teste inseridos com sucesso!' as resultado;
