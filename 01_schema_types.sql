-- SCHEMA BÁSICO - PARTE 1: TIPOS E FUNÇÕES
-- Execute este SQL primeiro no Supabase Studio

CREATE TYPE "public"."pix_key_type" AS ENUM (
    'cpf',
    'cnpj',
    'phone',
    'email',
    'random'
);

-- Função para adicionar coluna max_selections
CREATE OR REPLACE FUNCTION "public"."add_max_selections_column"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'form_field_settings' 
    AND column_name = 'max_selections'
  ) THEN
    ALTER TABLE form_field_settings
    ADD COLUMN max_selections integer CHECK (max_selections > 0);
  END IF;
END;
$$;
