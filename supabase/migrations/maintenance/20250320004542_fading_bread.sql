/*
  # Fix Email Templates

  1. Changes
    - Drop existing email_templates table
    - Recreate with proper constraints
    - Insert default templates with HTML content
    - Add policies for admin access
  
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Drop existing table and recreate
DROP TABLE IF EXISTS email_templates CASCADE;

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

-- Create policies
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
  'reset_password',
  'Reset Password',
  'Password Reset Request',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
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
      <h2>Password Reset</h2>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>We received a request to reset your account password. To create a new password, click the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Reset Password</a>
      </div>
      
      <div class="note">
        <p><strong>Note:</strong> This link is valid for 1 hour. After this period, you will need to request a new reset link.</p>
      </div>
      
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <p>For security reasons, we recommend that you change your password regularly and never share it with third parties.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>If you need help, please contact our support team.</p>
    </div>
  </div>
</body>
</html>'
),
(
  'signup_confirmation',
  'Signup Confirmation',
  'Confirm Your Email',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Confirmation</title>
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
      <h2>Welcome!</h2>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>Thank you for signing up! To confirm your email and activate your account, click the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Confirm Email</a>
      </div>
      
      <p>If you did not create an account, please ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>'
),
(
  'magic_link',
  'Magic Link',
  'Your Access Link',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Link</title>
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
      <h2>Access Link</h2>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>Here is your access link:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Access Account</a>
      </div>
      
      <div class="note">
        <p><strong>Note:</strong> This link is valid for 10 minutes.</p>
      </div>
      
      <p>If you did not request this link, please ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>'
),
(
  'change_email',
  'Change Email',
  'Confirm Your New Email',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Email Confirmation</title>
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
      <h2>New Email Confirmation</h2>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>To confirm your new email address, click the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{link}}" class="button">Confirm New Email</a>
      </div>
      
      <p>If you did not request this change, please ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>'
),
(
  'reauthentication',
  'Verification Code',
  'Your Verification Code',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
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
      <h2>Verification Code</h2>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>Your verification code is:</p>
      
      <div class="code">{{code}}</div>
      
      <div class="note">
        <p><strong>Note:</strong> This code is valid for 5 minutes.</p>
      </div>
      
      <p>If you did not request this code, please ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>If you need help, please contact our support team.</p>
    </div>
  </div>
</body>
</html>'
);