import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Responde ao preflight CORS
    return new Response("ok", { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  console.log("SERVICE_ROLE_KEY:", serviceRoleKey ? serviceRoleKey.substring(0, 8) + "..." : "NOT FOUND");
  console.log("SUPABASE_URL:", supabaseUrl);

  if (!serviceRoleKey) {
    console.log("ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente!");
    return new Response(JSON.stringify({ error: "Service Role Key não encontrada no ambiente da função." }), { status: 500, headers: corsHeaders });
  }

  if (!supabaseUrl) {
    console.log("ERRO: SUPABASE_URL não encontrada no ambiente!");
    return new Response(JSON.stringify({ error: "SUPABASE_URL não encontrada no ambiente da função." }), { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  );

  try {
    const { userId } = await req.json();
    console.log("userId recebido:", userId);

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId obrigatório" }), { status: 400, headers: corsHeaders });
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.log("Erro ao deletar do Auth:", JSON.stringify(error));
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.log("Erro interno:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500, headers: corsHeaders });
  }
}); 