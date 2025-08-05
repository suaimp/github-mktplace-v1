/*
  # Add article document storage

  1. New Storage
    - Create 'article_documents' storage bucket if it doesn't exist
  
  2. Schema Changes
    - Add 'article_document_path' column to 'order_items' table
  
  3. Security
    - Add RLS policies for the storage bucket with proper checks to avoid duplicates
*/

-- 1. Criar o bucket de armazenamento 'article_documents'
INSERT INTO storage.buckets (id, name, public)
VALUES ('article_documents', 'article_documents', false) -- 'false' para tornar o bucket privado
ON CONFLICT (id) DO NOTHING;

-- 2. Adicionar a coluna 'article_document_path' à tabela 'order_items'
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS article_document_path text;

-- 3. Configurar Políticas de RLS para o bucket 'article_documents'

-- Verificar e criar política para upload apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can upload article documents'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can upload article documents"
                ON storage.objects FOR INSERT
                TO authenticated
                WITH CHECK (
                  bucket_id = ''article_documents'' AND
                  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
                )';
    END IF;
END
$$;

-- Verificar e criar política para leitura de documentos próprios apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can read their own article documents'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can read their own article documents"
                ON storage.objects FOR SELECT
                TO authenticated
                USING (
                  bucket_id = ''article_documents'' AND
                  (owner = auth.uid() OR EXISTS (
                    SELECT 1 FROM public.order_items oi
                    JOIN public.orders o ON oi.order_id = o.id
                    WHERE oi.article_document_path = name AND o.user_id = auth.uid()
                  ))
                )';
    END IF;
END
$$;

-- Verificar e criar política para admins lerem todos os documentos apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Admins can read all article documents'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins can read all article documents"
                ON storage.objects FOR SELECT
                TO authenticated
                USING (
                  bucket_id = ''article_documents'' AND
                  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
                )';
    END IF;
END
$$;

-- Verificar e criar política para admins atualizarem documentos apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Admins can update article documents'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins can update article documents"
                ON storage.objects FOR UPDATE
                TO authenticated
                USING (
                  bucket_id = ''article_documents'' AND
                  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
                )';
    END IF;
END
$$;

-- Verificar e criar política para admins excluírem documentos apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Admins can delete article documents'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins can delete article documents"
                ON storage.objects FOR DELETE
                TO authenticated
                USING (
                  bucket_id = ''article_documents'' AND
                  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
                )';
    END IF;
END
$$;