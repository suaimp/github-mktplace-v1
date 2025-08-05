/*
  # Create Content Management Tables

  1. New Tables
    - `pages`
      - For managing static pages
      - Includes title, slug, content, meta data
    - `menu_items`
      - For managing dashboard menu structure
      - Includes name, icon, path, parent_id for nesting
    - `forms`
      - For managing dynamic forms
      - Includes title, fields, validation rules

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  path text,
  parent_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  requires_permission text,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  success_message text,
  failure_message text,
  submit_button_text text DEFAULT 'Submit',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create policies for pages
CREATE POLICY "Admins can read pages" 
  ON pages 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert pages" 
  ON pages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update pages" 
  ON pages 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete pages" 
  ON pages 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create policies for menu_items
CREATE POLICY "Admins can read menu_items" 
  ON menu_items 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert menu_items" 
  ON menu_items 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update menu_items" 
  ON menu_items 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete menu_items" 
  ON menu_items 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create policies for forms
CREATE POLICY "Admins can read forms" 
  ON forms 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert forms" 
  ON forms 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update forms" 
  ON forms 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can delete forms" 
  ON forms 
  FOR DELETE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Insert default permissions for content management
INSERT INTO permissions (code, name, description, category) VALUES
  ('pages.view', 'Visualizar páginas', 'Permite visualizar páginas do sistema', 'content'),
  ('pages.create', 'Criar páginas', 'Permite criar novas páginas', 'content'),
  ('pages.edit', 'Editar páginas', 'Permite editar páginas existentes', 'content'),
  ('pages.delete', 'Excluir páginas', 'Permite excluir páginas', 'content'),
  ('pages.publish', 'Publicar páginas', 'Permite publicar ou despublicar páginas', 'content'),
  
  ('menu.view', 'Visualizar menu', 'Permite visualizar itens do menu', 'content'),
  ('menu.create', 'Criar menu', 'Permite criar novos itens de menu', 'content'),
  ('menu.edit', 'Editar menu', 'Permite editar itens de menu existentes', 'content'),
  ('menu.delete', 'Excluir menu', 'Permite excluir itens de menu', 'content'),
  
  ('forms.view', 'Visualizar formulários', 'Permite visualizar formulários do sistema', 'content'),
  ('forms.create', 'Criar formulários', 'Permite criar novos formulários', 'content'),
  ('forms.edit', 'Editar formulários', 'Permite editar formulários existentes', 'content'),
  ('forms.delete', 'Excluir formulários', 'Permite excluir formulários', 'content'),
  ('forms.publish', 'Publicar formulários', 'Permite publicar ou despublicar formulários', 'content')
ON CONFLICT (code) DO NOTHING;

-- Assign new permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.code IN (
    'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
    'menu.view', 'menu.create', 'menu.edit', 'menu.delete',
    'forms.view', 'forms.create', 'forms.edit', 'forms.delete', 'forms.publish'
  )
ON CONFLICT DO NOTHING;