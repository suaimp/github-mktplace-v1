import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  let body;
  try {
    body = await req.json();
  } catch (e) {
    body = null;
  }
  // LOG DETALHADO DO WEBHOOK RECEBIDO
  console.log("=== WEBHOOK RECEBIDO ===", JSON.stringify(body, null, 2));
  if (body && body.type && body.data) {
    const eventType = body.type; // ex: 'charge.paid'
    const chargeId = body.data.id || body.data.charge_id;
    console.log("Evento recebido:", eventType, "ChargeId:", chargeId);
    console.log("ChargeId (com delimitadores): >" + chargeId + "<");
    // Função para remover espaços extras
    function cleanId(id) {
      return typeof id === 'string' ? id.trim() : id;
    }
    const cleanChargeId = cleanId(chargeId);
    console.log("ChargeId (limpo, delimitadores): >" + cleanChargeId + "<");
    if (eventType === "charge.paid" && cleanChargeId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Buscar pedido com payment_id limpo
      const { data: order, error } = await supabase.from("orders").select("id, payment_id, payment_status").eq("payment_id", cleanChargeId).maybeSingle();
      console.log("[WEBHOOK] Resultado da busca pelo pedido:", {
        order,
        error
      });
      if (!order) {
        console.error("[WEBHOOK] Pedido não encontrado para payment_id:", cleanChargeId);
        return new Response(JSON.stringify({
          success: false,
          error: "Pedido não encontrado"
        }), {
          status: 200,
          headers: corsHeaders
        });
      }
      await supabase.from("orders").update({
        payment_status: "paid"
      }).eq("id", order.id);
      // (Opcional) Disparar e-mail, etc.
      return new Response(JSON.stringify({
        success: true
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    // Retorne 200 para todos os eventos para evitar reenvio
    return new Response(JSON.stringify({
      received: true
    }), {
      status: 200,
      headers: corsHeaders
    });
  }
  // Se não for webhook válido, retorna 400
  return new Response(JSON.stringify({
    error: 'Webhook inválido'
  }), {
    status: 400,
    headers: corsHeaders
  });
});
