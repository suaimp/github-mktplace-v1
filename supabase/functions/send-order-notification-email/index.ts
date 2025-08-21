import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req) => {
  // Lida com requisições OPTIONS (pré-flight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    console.log("🔄 [EDGE_DEBUG] === FUNÇÃO EDGE INICIADA ===");
    console.log("🔄 [EDGE_DEBUG] Método:", req.method);
    console.log("🔄 [EDGE_DEBUG] Headers:", Object.fromEntries(req.headers.entries()));

    const body = await req.json();
    console.log("📥 [EDGE_DEBUG] Body recebido:", JSON.stringify(body, null, 2));

    const { to, subject, html, from } = body;

    // Validação básica
    if (!to || !subject || !html) {
      console.error("❌ [EDGE_DEBUG] Dados obrigatórios ausentes:", { to, subject: !!subject, html: !!html });
      return new Response(
        JSON.stringify({ error: "Dados obrigatórios ausentes (to, subject, html)." }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Garantir que 'to' seja um array
    const recipients = Array.isArray(to) ? to : [to];

    console.log("📧 [EDGE_DEBUG] Configuração do email:", {
      recipients: recipients,
      recipientsCount: recipients.length,
      subject,
      fromEmail: from?.email || "noreply@cp.suaimprensa.com.br",
      fromName: from?.name || "Marketplace Sua Imprensa",
      htmlLength: html.length
    });

    // Chave da API do Resend (deve estar configurada nas variáveis de ambiente)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    // Modo de desenvolvimento - simula envio se não há API key real
    if (!RESEND_API_KEY || RESEND_API_KEY === "re_development_key_placeholder") {
      console.log("🧪 [EDGE_DEBUG] MODO DESENVOLVIMENTO - Simulando envio de email");
      console.log("📧 [EDGE_DEBUG] Email simulado enviado para:", recipients);
      console.log("📧 [EDGE_DEBUG] Assunto:", subject);
      console.log("📧 [EDGE_DEBUG] Para ver emails reais, configure RESEND_API_KEY");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: "development",
          message: "Email simulado enviado com sucesso",
          recipients: recipients,
          subject: subject
        }),
        { status: 200, headers: corsHeaders() }
      );
    }

    console.log("🔑 [EDGE_DEBUG] API Key encontrada, comprimento:", RESEND_API_KEY.length);

    const resendPayload = {
      from: from ? `${from.name} <${from.email}>` : "Marketplace Sua Imprensa <noreply@cp.suaimprensa.com.br>",
      to: recipients,
      subject: subject,
      html: html,
    };

    console.log("🚀 [EDGE_DEBUG] Payload para Resend:", {
      from: resendPayload.from,
      to: resendPayload.to,
      subject: resendPayload.subject,
      htmlLength: resendPayload.html.length
    });

    // Envio do e-mail via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    console.log("📡 [EDGE_DEBUG] Resposta da Resend - Status:", response.status);
    console.log("📡 [EDGE_DEBUG] Resposta da Resend - Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [EDGE_DEBUG] Erro da Resend:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      return new Response(
        JSON.stringify({ error: "Erro ao enviar e-mail", details: errorText }),
        { status: 500, headers: corsHeaders() }
      );
    }

    const result = await response.json();
    console.log("✅ [EDGE_DEBUG] Email enviado com sucesso:", result);
    console.log("🔄 [EDGE_DEBUG] === FUNÇÃO EDGE FINALIZADA COM SUCESSO ===");

    return new Response(
      JSON.stringify({ success: true, data: result }), 
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("❌ [EDGE_DEBUG] Erro interno na função Edge:", err);
    console.error("❌ [EDGE_DEBUG] Stack trace:", err.stack);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(err) }),
      { status: 500, headers: corsHeaders() }
    );
  }
});
