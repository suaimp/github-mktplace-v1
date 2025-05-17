/*
  # Fix Email Templates

  1. Changes
    - Ensure reset_password template exists
    - Update template content with proper HTML
    - Add missing templates if needed
  
  2. Security
    - Maintain existing RLS policies
*/

-- Insert or update reset password template
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
)
ON CONFLICT (code) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body;