-- Criação de novas policies para a tabela notifications
-- Parte 3B: RLS Policies atualizadas

-- Policy para leitura (SELECT)
CREATE POLICY "Authenticated users can read notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (
  -- Usuário pode ver notificações onde ele é o customer (destinatário)
  customer_id = auth.uid() OR
  -- Admins podem ver todas as notificações
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

-- Policy para criação (INSERT)
CREATE POLICY "Authenticated users can create notifications" 
ON notifications FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Qualquer usuário autenticado pode criar notificações
  auth.uid() IS NOT NULL
);

-- Policy para atualização (UPDATE)
CREATE POLICY "Authenticated users can update notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (
  -- Usuário pode atualizar notificações onde ele é o customer
  customer_id = auth.uid() OR
  -- Admins podem atualizar todas as notificações
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);

-- Policy para exclusão (DELETE)
CREATE POLICY "Authenticated users can delete notifications" 
ON notifications FOR DELETE 
TO authenticated 
USING (
  -- Usuário pode deletar notificações onde ele é o customer
  customer_id = auth.uid() OR
  -- Admins podem deletar todas as notificações
  EXISTS (
    SELECT 1 FROM admins a 
    JOIN roles r ON a.role_id = r.id 
    WHERE a.id = auth.uid() AND r.name = 'admin'
  )
);
