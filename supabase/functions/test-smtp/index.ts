import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req)=>{
  // Enable CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
  const result = {
    success: false,
    stage: "validation",
    message: ""
  };
  try {
    // Parse and validate request body
    const { settings, test_email } = await req.json();
    // Validate all required fields
    const requiredFields = {
      "API Key": settings?.pass,
      "Email de envio": settings?.from_email,
      "Nome de exibição": settings?.from_name,
      "Email de teste": test_email
    };
    const missingFields = Object.entries(requiredFields).filter(([_, value])=>!value).map(([key])=>key);
    if (missingFields.length > 0) {
      result.message = "Campos obrigatórios não preenchidos";
      result.details = `Os seguintes campos são obrigatórios: ${missingFields.join(", ")}`;
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.from_email) || !emailRegex.test(test_email)) {
      result.message = "Formato de email inválido";
      result.details = "Verifique se os endereços de email estão corretos";
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Validate Resend API key format
    if (!settings.pass.startsWith('re_')) {
      result.message = "API Key do Resend inválida";
      result.details = "A API Key deve começar com 're_'";
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Create SMTP client
    const client = new SmtpClient();
    try {
      // Attempt connection
      result.stage = "connection";
      await client.connect({
        hostname: settings.host,
        port: parseInt(settings.port),
        username: settings.user,
        password: settings.pass,
        tls: true
      });
      // Connection successful, attempt to send
      result.stage = "sending";
      await client.send({
        from: `${settings.from_name} <${settings.from_email}>`,
        to: test_email,
        subject: "Teste de Configuração SMTP",
        content: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Teste de Configuração SMTP</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #465fff;">Teste de Configuração SMTP</h2>
              <p>Este é um email de teste para verificar as configurações SMTP.</p>
              <p>Se você está recebendo este email, significa que as configurações SMTP estão funcionando corretamente.</p>
              <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold;">Configurações testadas:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Servidor: ${settings.host}</li>
                  <li>Porta: ${settings.port}</li>
                  <li>Email de envio: ${settings.from_email}</li>
                  <li>Nome de exibição: ${settings.from_name}</li>
                </ul>
              </div>
              <p style="color: #666; font-size: 0.9em;">
                Data e hora do teste: ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
          </html>
        `
      });
      // Close connection
      await client.close();
      // Return success
      result.success = true;
      result.message = "Email de teste enviado com sucesso";
      result.details = "Verifique sua caixa de entrada para confirmar o recebimento";
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      // Handle specific SMTP errors
      console.error("SMTP Error:", error);
      result.success = false;
      result.technicalDetails = {
        error: error.message,
        code: error.code,
        command: error.command
      };
      // Determine error type and provide specific message
      if (error.message?.includes("connect")) {
        result.message = "Erro ao conectar ao servidor SMTP";
        result.details = "Verifique se o servidor e a porta estão corretos e acessíveis";
      } else if (error.message?.includes("authentication")) {
        result.message = "Erro de autenticação SMTP";
        result.details = "Verifique se a API Key do Resend está correta";
      } else if (error.message?.includes("timeout")) {
        result.message = "Tempo limite excedido";
        result.details = "O servidor SMTP demorou muito para responder";
      } else if (error.message?.includes("SSL")) {
        result.message = "Erro de conexão segura";
        result.details = "Verifique se a porta está configurada para SSL/TLS";
      } else {
        result.message = "Erro ao enviar email de teste";
        result.details = "Ocorreu um erro inesperado durante o envio";
      }
      // Close connection on error
      try {
        await client.close();
      } catch  {}
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error("Request Error:", error);
    result.message = "Erro ao processar requisição";
    result.details = "Ocorreu um erro ao processar os dados enviados";
    result.technicalDetails = {
      error: error.message
    };
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
