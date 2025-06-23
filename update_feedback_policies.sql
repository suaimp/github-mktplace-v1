-- Políticas de segurança atualizadas para feedback_submissions
-- Permitir que administradores vejam todos os feedbacks

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own feedback_submissions" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Users can create own feedback_submissions" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Users can update own feedback_submissions" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Users can delete own feedback_submissions" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Admins can view all feedback_submissions" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Admins can update all feedback_submissions" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Admins can delete all feedback_submissions" ON public.feedback_submissions;

-- Política SELECT - Usuários podem ver seus próprios feedbacks, admins veem todos
CREATE POLICY "Users can view own feedback_submissions, admins view all"
ON public.feedback_submissions
FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.admins WHERE admins.id = auth.uid()
  )
);

-- Política INSERT - Usuários autenticados podem criar feedbacks para si mesmos
CREATE POLICY "Users can create own feedback_submissions"
ON public.feedback_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Política UPDATE - Usuários podem atualizar seus próprios feedbacks, admins podem atualizar todos
CREATE POLICY "Users can update own feedback_submissions, admins update all"
ON public.feedback_submissions
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.admins WHERE admins.id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.admins WHERE admins.id = auth.uid()
  )
);

-- Política DELETE - Usuários podem deletar seus próprios feedbacks, admins podem deletar todos
CREATE POLICY "Users can delete own feedback_submissions, admins delete all"
ON public.feedback_submissions
FOR DELETE
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.admins WHERE admins.id = auth.uid()
  )
);

-- Habilitar RLS na tabela (se ainda não estiver habilitado)
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
