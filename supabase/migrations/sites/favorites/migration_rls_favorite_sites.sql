-- Migration: RLS policies for favorite_sites
-- Responsabilidade: Adicionar RLS e permissões para usuários autenticados (admins ou platform_users)

-- Habilitar RLS
ALTER TABLE favorite_sites ENABLE ROW LEVEL SECURITY;

-- Política: Permitir que apenas usuários autenticados possam acessar seus próprios favoritos
CREATE POLICY "Authenticated users can access their own favorite sites" ON favorite_sites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_users WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Política: Permitir inserção apenas para usuários autenticados
CREATE POLICY "Authenticated users can insert favorite sites" ON favorite_sites
  FOR INSERT
  WITH CHECK (
    (
      EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid())
    )
    AND user_id = auth.uid()
  );
