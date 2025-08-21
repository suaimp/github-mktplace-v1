-- Test data for local development
-- First, insert auth users
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'user1@example.com', NOW(), NOW(), NOW()),
  ('123e4567-e89b-12d3-a456-426614174001', 'user2@example.com', NOW(), NOW(), NOW()),
  ('123e4567-e89b-12d3-a456-426614174002', 'admin@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test users into platform_users
INSERT INTO public.platform_users (id, email, role, first_name, last_name, created_at) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'user1@example.com', 'user', 'Test', 'User1', NOW()),
  ('123e4567-e89b-12d3-a456-426614174001', 'user2@example.com', 'user', 'Test', 'User2', NOW()),
  ('123e4567-e89b-12d3-a456-426614174002', 'admin@example.com', 'admin', 'Admin', 'User', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test form entries
INSERT INTO public.form_entries (id, user_id, form_data, created_at) VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', '{"name": "Test Form 1", "type": "contact"}', NOW()),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174001', '{"name": "Test Form 2", "type": "feedback"}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test orders
INSERT INTO public.orders (id, user_id, total_amount, status, created_at) VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 99.99, 'completed', NOW()),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174001', 149.99, 'pending', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert notification types (se não existirem)
INSERT INTO public.notification_types (type) VALUES 
  ('chat'),
  ('purchase'),
  ('system'),
  ('email')
ON CONFLICT (type) DO NOTHING;
