-- Script para resetar limites de autenticação do Supabase
-- Execute este comando no SQL Editor do Supabase Dashboard

-- 1. Limpar tentativas de login bloqueadas
DELETE FROM auth.audit_log_entries 
WHERE event_type = 'signin_attempt' 
AND created_at > NOW() - INTERVAL '1 hour';

-- 2. Resetar rate limiting para o email específico
-- Substitua 'moisesazevedo2020@gmail.com' pelo seu email
DELETE FROM auth.mfa_challenges 
WHERE factor_id IN (
  SELECT id FROM auth.mfa_factors 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'moisesazevedo2020@gmail.com'
  )
);

-- 3. Limpar sessões expiradas
DELETE FROM auth.sessions 
WHERE expires_at < NOW();

-- 4. Verificar usuário
SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
FROM auth.users 
WHERE email = 'moisesazevedo2020@gmail.com';
