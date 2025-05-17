/*
  # Create Email Templates Table
  
  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Template identifier (e.g., signup_confirmation)
      - `name` (text) - Display name
      - `subject` (text) - Email subject
      - `body` (text) - Email body content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add indexes for performance
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates table
CREATE POLICY "Admins can read email templates" 
  ON email_templates 
  FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can update email templates" 
  ON email_templates 
  FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_code ON email_templates(code);

-- Insert default templates
INSERT INTO email_templates (code, name, subject, body) VALUES
  (
    'signup_confirmation',
    'Confirmação de Cadastro',
    'Confirme seu cadastro',
    'Olá {{name}},\n\nBem-vindo! Para confirmar seu cadastro, clique no link abaixo:\n\n{{link}}\n\nSe você não solicitou este cadastro, ignore este email.'
  ),
  (
    'invitation',
    'Convite',
    'Você foi convidado',
    'Olá,\n\nVocê foi convidado para se juntar à nossa plataforma. Clique no link abaixo para aceitar o convite:\n\n{{link}}\n\nEste convite expira em 24 horas.'
  ),
  (
    'magic_link',
    'Link Mágico',
    'Seu link de acesso',
    'Olá {{name}},\n\nAqui está seu link de acesso:\n\n{{link}}\n\nEste link expira em 10 minutos.'
  ),
  (
    'change_email',
    'Alteração de Email',
    'Confirme seu novo email',
    'Olá {{name}},\n\nPara confirmar seu novo endereço de email, clique no link abaixo:\n\n{{link}}\n\nSe você não solicitou esta alteração, ignore este email.'
  ),
  (
    'reset_password',
    'Redefinição de Senha',
    'Redefinição de senha solicitada',
    'Olá {{name}},\n\nVocê solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:\n\n{{link}}\n\nSe você não solicitou esta alteração, ignore este email.'
  ),
  (
    'reauthentication',
    'Reautenticação',
    'Confirme seu acesso',
    'Olá {{name}},\n\nPara confirmar seu acesso, use o código abaixo:\n\n{{code}}\n\nEste código expira em 5 minutos.'
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body = EXCLUDED.body;