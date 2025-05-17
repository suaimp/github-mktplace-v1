/*
  # Update Email Templates with HTML Support
  
  1. Changes
    - Add HTML templates for password reset
    - Update existing templates with HTML versions
    - Add support for template variables
  
  2. Security
    - Maintain existing RLS policies
    - Keep template access restricted to admins
*/

-- Update reset password template with HTML version
UPDATE email_templates 
SET subject = 'Recuperação de Senha',
    body = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #465fff;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e4e7ec;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #465fff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
    .note {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Recuperação de Senha</h2>
    </div>
    <div class="content">
      <p>Olá {{name}},</p>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Para criar uma nova senha, clique no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Redefinir Senha</a>
      </div>
      
      <div class="note">
        <p><strong>Observação:</strong> Este link é válido por 1 hora. Após esse período, você precisará solicitar um novo link de recuperação.</p>
      </div>
      
      <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma.</p>
      
      <p>Por motivos de segurança, recomendamos que você altere sua senha regularmente e nunca a compartilhe com terceiros.</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático. Por favor, não responda.</p>
      <p>Se precisar de ajuda, entre em contato com nossa equipe de suporte.</p>
    </div>
  </div>
</body>
</html>'
WHERE code = 'reset_password';

-- Update signup confirmation template with HTML version
UPDATE email_templates 
SET subject = 'Confirme seu cadastro',
    body = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Cadastro</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #465fff;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e4e7ec;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #465fff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Bem-vindo!</h2>
    </div>
    <div class="content">
      <p>Olá {{name}},</p>
      
      <p>Obrigado por se cadastrar! Para confirmar seu email e ativar sua conta, clique no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Confirmar Email</a>
      </div>
      
      <p>Se você não criou uma conta, ignore este email.</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>'
WHERE code = 'signup_confirmation';

-- Update magic link template with HTML version
UPDATE email_templates 
SET subject = 'Seu link de acesso',
    body = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link de Acesso</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #465fff;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e4e7ec;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #465fff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
    .note {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Link de Acesso</h2>
    </div>
    <div class="content">
      <p>Olá {{name}},</p>
      
      <p>Aqui está seu link de acesso:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Acessar Conta</a>
      </div>
      
      <div class="note">
        <p><strong>Observação:</strong> Este link é válido por 10 minutos.</p>
      </div>
      
      <p>Se você não solicitou este link, ignore este email.</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>'
WHERE code = 'magic_link';

-- Update change email template with HTML version
UPDATE email_templates 
SET subject = 'Confirme seu novo email',
    body = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Novo Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #465fff;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e4e7ec;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #465fff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Confirmação de Novo Email</h2>
    </div>
    <div class="content">
      <p>Olá {{name}},</p>
      
      <p>Para confirmar seu novo endereço de email, clique no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Confirmar Novo Email</a>
      </div>
      
      <p>Se você não solicitou esta alteração, ignore este email.</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>'
WHERE code = 'change_email';

-- Update reauthentication template with HTML version
UPDATE email_templates 
SET subject = 'Código de Verificação',
    body = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #465fff;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 0 0 5px 5px;
      border: 1px solid #e4e7ec;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 5px;
      margin: 20px 0;
      color: #465fff;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
    .note {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Código de Verificação</h2>
    </div>
    <div class="content">
      <p>Olá {{name}},</p>
      
      <p>Seu código de verificação é:</p>
      
      <div class="code">{{code}}</div>
      
      <div class="note">
        <p><strong>Observação:</strong> Este código é válido por 5 minutos.</p>
      </div>
      
      <p>Se você não solicitou este código, ignore este email.</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático. Por favor, não responda.</p>
      <p>Se precisar de ajuda, entre em contato com nossa equipe de suporte.</p>
    </div>
  </div>
</body>
</html>'
WHERE code = 'reauthentication';