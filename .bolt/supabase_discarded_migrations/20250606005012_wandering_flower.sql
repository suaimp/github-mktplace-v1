/*
  # Adicionar armazenamento para documentos de artigos

  1. Novas Funcionalidades
    - Criação do bucket `article_documents` para armazenar arquivos DOCX de artigos
    - Adição da coluna `article_document_path` à tabela `order_items` para armazenar o caminho do arquivo
    - Configuração de políticas de RLS para o bucket `article_documents`
  
  2. Segurança
    - Configuração de políticas para permitir que usuários autenticados façam upload e leiam seus próprios documentos
    - Configuração de políticas para permitir que administradores gerenciem todos os documentos
*/

-- 1. Criar o bucket de armazenamento 'article_documents'
INSERT INTO storage.buckets (id, name, public)
VALUES ('article_documents', 'article_documents', false) -- 'false' para tornar o bucket privado
ON CONFLICT (id) DO NOTHING;

-- 2. Adicionar a coluna 'article_document_path' à tabela 'order_items'
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS article_document_path text;

-- 3. Configurar Políticas de RLS para o bucket 'article_documents'

-- Permitir que usuários autenticados façam upload de documentos
CREATE POLICY "Authenticated users can upload article documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article_documents' AND
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid()) -- Apenas usuários autenticados
);

-- Permitir que usuários autenticados leiam seus próprios documentos
CREATE POLICY "Authenticated users can read their own article documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  (owner = auth.uid() OR EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.article_document_path = name AND o.user_id = auth.uid()
  ))
);

-- Permitir que administradores leiam todos os documentos
CREATE POLICY "Admins can read all article documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) -- Apenas admins podem ler todos
);

-- Permitir que administradores atualizem documentos
CREATE POLICY "Admins can update article documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Permitir que administradores excluam documentos
CREATE POLICY "Admins can delete article documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article_documents' AND
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);