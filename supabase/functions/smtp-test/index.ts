import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }
  const { to, subject, message } = await req.json();
  // Aqui você deve configurar seu servidor SMTP
  const smtpServer = "smtp.example.com"; // Substitua pelo seu servidor SMTP
  const smtpPort = 587; // Porta do servidor SMTP
  const smtpUser = "user@example.com"; // Substitua pelo seu usuário SMTP
  const smtpPass = "yourpassword"; // Substitua pela sua senha SMTP
  const email = {
    to,
    subject,
    text: message
  };
  try {
    // Envio do e-mail usando a API de e-mail do Deno
    await fetch(`https://${smtpServer}:${smtpPort}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${smtpUser}:${smtpPass}`)
      },
      body: JSON.stringify(email)
    });
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully!'
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
