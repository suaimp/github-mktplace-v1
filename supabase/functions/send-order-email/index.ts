import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

/**
 * Busca o nome da plataforma das configurações
 */
async function getPlatformName(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('⚙️ [PlatformName] Buscando configurações da plataforma...');

    const { data, error } = await supabase
      .from('settings')
      .select('site_title')
      .single();

    if (error) {
      console.warn('⚠️ [PlatformName] Erro ao buscar configurações, usando padrão:', error);
      return 'Marketplace Sua Imprensa';
    }

    const platformName = data.site_title || 'Marketplace Sua Imprensa';
    console.log('✅ [PlatformName] Nome da plataforma carregado:', platformName);
    return platformName;
  } catch (error) {
    console.error('❌ [PlatformName] Erro ao buscar configurações:', error);
    return 'Marketplace Sua Imprensa';
  }
}

serve(async (req) => {
  // Lida com requisições OPTIONS (pré-flight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const { order } = await req.json();

    // Validação básica
    if (!order) {
      return new Response(
        JSON.stringify({ error: "Dados da compra ausentes." }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Email do cliente e email configurado para receber notificações
    const clientEmail = order.email;
    const adminEmail = "contato@suaimprensa.com.br"; // Email configurado para receber notificações

    // Monte o corpo do e-mail com os dados da compra
    const orderDetails = `
      <h2>Nova compra realizada!</h2>
      <p><strong>Cliente:</strong> ${order.name} (${order.email})</p>
      <p><strong>Valor Total:</strong> R$ ${order.total}</p>
      <h3>Itens:</h3>
      <ul>
        ${order.items
          .map(
            (item: any) =>
              `<li>
                <strong>Produto:</strong> ${item.name}<br/>
                <strong>Quantidade:</strong> ${item.quantity}<br/>
                <strong>Nicho:</strong> ${item.niche || "-"}<br/>
                <strong>Pacote:</strong> ${item.package || "-"}<br/>
                <strong>Qtd. Palavras:</strong> ${item.word_count || "-"}
              </li>`
          )
          .join("")}
      </ul>
    `;

    // Buscar nome dinâmico da plataforma
    const platformName = await getPlatformName();
    console.log('📧 [OrderEmail] Usando nome da plataforma:', platformName);

    // Chave da API do Resend (adicione como variável de ambiente no Supabase)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API Key do Resend não configurada." }),
        { status: 500, headers: corsHeaders() }
      );
    }

    // Envio do e-mail via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${platformName} <noreply@cp.suaimprensa.com.br>`,
        to: [clientEmail], // Cliente recebe no campo "Para"
        bcc: [adminEmail], // Admin recebe em CCO (oculto)
        subject: "Nova compra realizada",
        html: orderDetails,
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