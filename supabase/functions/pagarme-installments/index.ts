import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
// Removido import do v4 do uuid

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

function withCorsHeaders(resp: Response) {
  const headers = new Headers(resp.headers);
  for (const [k, v] of Object.entries(corsHeaders)) {
    headers.set(k, v);
  }
  return new Response(resp.body, { status: resp.status, headers });
}

function log(request_id: string, info: object) {
  console.log(JSON.stringify({ request_id, ...info }));
}

function generateRequestId() {
  return crypto.randomUUID();
}

function errorResponse({
  message,
  request_id,
  status = 500,
  data = null,
}: {
  message: string;
  request_id: string;
  status?: number;
  data?: any;
}) {
  const resp = new Response(
    JSON.stringify({ success: false, message, request_id, data }),
    { status, headers: { "Content-Type": "application/json" } }
  );
  return withCorsHeaders(resp);
}

function successResponse({
  message,
  request_id,
  data = null,
}: {
  message: string;
  request_id: string;
  data?: any;
}) {
  const resp = new Response(
    JSON.stringify({ success: true, message, request_id, data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
  return withCorsHeaders(resp);
}

serve(async (req) => {
  const request_id = generateRequestId();
  // Handler OPTIONS simplificado
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    // Apenas POST
    if (req.method !== "POST") {
      log(request_id, { level: "warn", message: "Método não permitido", method: req.method });
      return errorResponse({
        message: "Método não permitido",
        request_id,
        status: 405,
      });
    }

    // Autenticação do usuário
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader ? authHeader.replace("Bearer ", "") : "";
    if (!jwt) {
      log(request_id, { level: "warn", message: "Token de autenticação ausente" });
      return errorResponse({
        message: "Token de autenticação ausente",
        request_id,
        status: 401,
      });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    if (error || !user) {
      log(request_id, { level: "warn", message: "Usuário não autenticado", error });
      return errorResponse({
        message: 'Não autorizado',
        request_id,
        status: 401,
      });
    }

    // Parse e validação do body
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      log(request_id, { level: "warn", message: "Body inválido", error: e.message });
      return errorResponse({
        message: "Body inválido: não é um JSON válido",
        request_id,
        status: 400,
      });
    }
    console.log("PAYLOAD RECEBIDO:", JSON.stringify(body));
    log(request_id, { level: "info", message: "Payload recebido", body });

    // Validação dos campos obrigatórios
    const { amount, card_brand, description, quantity } = body;
    if (
      !amount || typeof amount !== "number" || amount < 100 ||
      !card_brand || typeof card_brand !== "string" || card_brand.length < 3
    ) {
      log(request_id, { level: "warn", message: "Payload inválido", body });
      return errorResponse({
        message: "Payload inválido: amount ou card_brand",
        request_id,
        status: 400,
      });
    }

    // Regras por bandeira
    const rules = {
      visa: { max: 12, minValue: 500 },
      mastercard: { max: 12, minValue: 500 },
      elo: { max: 6, minValue: 500 },
      amex: { max: 12, minValue: 500 },
      default: { max: 6, minValue: 500 }
    };
    const rule = rules[card_brand?.toLowerCase()] || rules.default;

    // Cálculo local das parcelas
    const installments = [];
    for (let i = 1; i <= rule.max; i++) {
      const valorParcela = Math.floor(amount / i);
      if (valorParcela >= rule.minValue) {
        installments.push({
          installments: i,
          amount: valorParcela,
          total: valorParcela * i,
        });
      }
    }

    log(request_id, { level: "info", message: "Simulação local de parcelas bem-sucedida", installments });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Simulação local realizada com sucesso",
        request_id,
        installments // <-- agora na raiz
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    log(request_id, { level: "fatal", message: "Erro inesperado", error: err.message, stack: err.stack });
    return errorResponse({
      message: err.message || String(err),
      request_id,
      status: 500,
    });
  }
}); 