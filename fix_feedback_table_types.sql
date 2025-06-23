-- Corrigir tipos da tabela feedback_submissions
-- Alterar category e priority de text[] para text

-- Primeiro, verificar se existem dados na tabela
-- Se houver dados, eles serão convertidos automaticamente

ALTER TABLE feedback_submissions 
ALTER COLUMN category TYPE text USING 
  CASE 
    WHEN category IS NULL THEN NULL
    WHEN array_length(category, 1) > 0 THEN category[1]
    ELSE 'Outros'
  END;

ALTER TABLE feedback_submissions 
ALTER COLUMN priority TYPE text USING 
  CASE 
    WHEN priority IS NULL THEN NULL
    WHEN array_length(priority, 1) > 0 THEN priority[1]
    ELSE 'Média'
  END;
