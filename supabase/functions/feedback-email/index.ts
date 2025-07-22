import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const { feedback } = await req.json();

    if (!feedback) {
      return new Response(
        JSON.stringify({ error: "Dados do feedback ausentes." }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Montar corpo do e-mail com os dados do feedback
    const feedbackDetails = `
      <h2>Novo feedback recebido!</h2>
      <p><strong>Nome:</strong> ${feedback.name}</p>
      <p><strong>Email:</strong> ${feedback.email}</p>
      <p><strong>Telefone:</strong> ${feedback.phone}</p>
      <p><strong>Categoria:</strong> ${feedback.category}</p>
      <p><strong>Assunto:</strong> ${feedback.subject}</p>
      <p><strong>Mensagem:</strong><br/>${feedback.message}</p>
    `;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API Key do Resend não configurada." }),
        { status: 500, headers: corsHeaders() }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Feedback Marketplace <noreply@cp.suaimprensa.com.br>",
        to: ["contato@suaimprensa.com.br"],
        subject: "Novo feedback recebido",
        html: feedbackDetails,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao enviar e-mail via Resend:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar e-mail", details: errorText }),
        { status: 500, headers: corsHeaders() }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error("Erro interno na função Edge:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: String(err) }),
      { status: 500, headers: corsHeaders() }
    );
  }
}); 