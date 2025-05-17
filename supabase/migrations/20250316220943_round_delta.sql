/*
  # Create Role-Based Permissions System

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text) - Role name (admin, manager, publisher, advertiser)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `permissions`
      - `id` (uuid, primary key)
      - `code` (text) - Unique permission code
      - `name` (text) - Permission name
      - `description` (text)
      - `category` (text) - Permission category for grouping
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `role_permissions`
      - `role_id` (uuid, references roles)
      - `permission_id` (uuid, references permissions)
      - Primary key on (role_id, permission_id)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can read roles" 
  ON roles 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can read permissions" 
  ON permissions 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can read role_permissions" 
  ON role_permissions 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador com acesso total ao sistema'),
  ('manager', 'Gerente com permissões moderadas'),
  ('publisher', 'Publisher com acesso a ferramentas de publicação'),
  ('advertiser', 'Anunciante com acesso a ferramentas de anúncios')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (code, name, description, category) VALUES
  -- User Management
  ('user.view', 'Visualizar usuários', 'Permite visualizar lista de usuários', 'users'),
  ('user.create', 'Criar usuários', 'Permite criar novos usuários', 'users'),
  ('user.edit', 'Editar usuários', 'Permite editar dados de usuários', 'users'),
  ('user.delete', 'Excluir usuários', 'Permite excluir usuários', 'users'),
  
  -- Settings
  ('settings.view', 'Visualizar configurações', 'Permite visualizar configurações do sistema', 'settings'),
  ('settings.edit', 'Editar configurações', 'Permite modificar configurações do sistema', 'settings'),
  
  -- Financial
  ('finance.view', 'Visualizar financeiro', 'Permite visualizar relatórios financeiros', 'finance'),
  ('finance.manage', 'Gerenciar financeiro', 'Permite gerenciar transações financeiras', 'finance'),
  ('finance.withdraw', 'Solicitar saque', 'Permite solicitar saques', 'finance'),
  
  -- Content
  ('content.view', 'Visualizar conteúdo', 'Permite visualizar conteúdo', 'content'),
  ('content.create', 'Criar conteúdo', 'Permite criar novo conteúdo', 'content'),
  ('content.edit', 'Editar conteúdo', 'Permite editar conteúdo', 'content'),
  ('content.delete', 'Excluir conteúdo', 'Permite excluir conteúdo', 'content'),
  ('content.publish', 'Publicar conteúdo', 'Permite publicar conteúdo', 'content'),
  
  -- Ads
  ('ads.view', 'Visualizar anúncios', 'Permite visualizar anúncios', 'ads'),
  ('ads.create', 'Criar anúncios', 'Permite criar novos anúncios', 'ads'),
  ('ads.edit', 'Editar anúncios', 'Permite editar anúncios', 'ads'),
  ('ads.delete', 'Excluir anúncios', 'Permite excluir anúncios', 'ads'),
  ('ads.publish', 'Publicar anúncios', 'Permite publicar anúncios', 'ads'),
  
  -- Reports
  ('reports.view', 'Visualizar relatórios', 'Permite visualizar relatórios', 'reports'),
  ('reports.export', 'Exportar relatórios', 'Permite exportar relatórios', 'reports'),
  
  -- Support
  ('support.view', 'Visualizar suporte', 'Permite visualizar tickets de suporte', 'support'),
  ('support.respond', 'Responder suporte', 'Permite responder tickets de suporte', 'support'),
  ('support.manage', 'Gerenciar suporte', 'Permite gerenciar sistema de suporte', 'support')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to roles
DO $$ 
DECLARE
  admin_role_id uuid;
  manager_role_id uuid;
  publisher_role_id uuid;
  advertiser_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO manager_role_id FROM roles WHERE name = 'manager';
  SELECT id INTO publisher_role_id FROM roles WHERE name = 'publisher';
  SELECT id INTO advertiser_role_id FROM roles WHERE name = 'advertiser';

  -- Admin gets all permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM permissions
  ON CONFLICT DO NOTHING;

  -- Manager permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT manager_role_id, id FROM permissions 
  WHERE code IN (
    'user.view',
    'user.edit',
    'content.view',
    'content.create',
    'content.edit',
    'content.delete',
    'content.publish',
    'ads.view',
    'ads.create',
    'ads.edit',
    'ads.delete',
    'ads.publish',
    'reports.view',
    'reports.export',
    'support.view',
    'support.respond'
  )
  ON CONFLICT DO NOTHING;

  -- Publisher permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT publisher_role_id, id FROM permissions 
  WHERE code IN (
    'content.view',
    'content.create',
    'content.edit',
    'content.delete',
    'finance.view',
    'finance.withdraw',
    'reports.view',
    'support.view'
  )
  ON CONFLICT DO NOTHING;

  -- Advertiser permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT advertiser_role_id, id FROM permissions 
  WHERE code IN (
    'ads.view',
    'ads.create',
    'ads.edit',
    'ads.delete',
    'finance.view',
    'finance.withdraw',
    'reports.view',
    'support.view'
  )
  ON CONFLICT DO NOTHING;
END $$;