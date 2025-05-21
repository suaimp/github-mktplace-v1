-- Add email_templates column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS email_templates JSONB;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_email_templates ON settings USING GIN (email_templates);

-- Add default templates
UPDATE settings 
SET email_templates = '{
  "signup_confirmation": {
    "name": "Confirmação de Cadastro",
    "subject": "Confirme seu cadastro",
    "body": "Olá {{name}},\n\nBem-vindo! Para confirmar seu cadastro, clique no link abaixo:\n\n{{link}}\n\nSe você não solicitou este cadastro, ignore este email."
  },
  "invitation": {
    "name": "Convite",
    "subject": "Você foi convidado",
    "body": "Olá,\n\nVocê foi convidado para se juntar à nossa plataforma. Clique no link abaixo para aceitar o convite:\n\n{{link}}\n\nEste convite expira em 24 horas."
  },
  "magic_link": {
    "name": "Link Mágico",
    "subject": "Seu link de acesso",
    "body": "Olá {{name}},\n\nAqui está seu link de acesso:\n\n{{link}}\n\nEste link expira em 10 minutos."
  },
  "change_email": {
    "name": "Alteração de Email",
    "subject": "Confirme seu novo email",
    "body": "Olá {{name}},\n\nPara confirmar seu novo endereço de email, clique no link abaixo:\n\n{{link}}\n\nSe você não solicitou esta alteração, ignore este email."
  },
  "reset_password": {
    "name": "Redefinição de Senha",
    "subject": "Redefinição de senha solicitada",
    "body": "Olá {{name}},\n\nVocê solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:\n\n{{link}}\n\nSe você não solicitou esta alteração, ignore este email."
  },
  "reauthentication": {
    "name": "Reautenticação",
    "subject": "Confirme seu acesso",
    "body": "Olá {{name}},\n\nPara confirmar seu acesso, use o código abaixo:\n\n{{code}}\n\nEste código expira em 5 minutos."
  }
}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM settings WHERE email_templates IS NOT NULL
);