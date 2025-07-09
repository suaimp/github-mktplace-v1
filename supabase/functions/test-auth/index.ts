import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  // TRATE O OPTIONS PRIMEIRO!
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("[DEBUG] Requisição recebida - Headers:", Object.fromEntries(req.headers.entries()));

  // Autenticação do usuário
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  console.log("[DEBUG] Supabase URL:", supabaseUrl);
  console.log("[DEBUG] Supabase Anon Key:", supabaseAnonKey ? "PRESENTE" : "AUSENTE");
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const authHeader = req.headers.get("Authorization");
  console.log("[DEBUG] Authorization Header:", authHeader ? "PRESENTE" : "AUSENTE");
  
  const jwt = authHeader ? authHeader.replace("Bearer ", "") : "";
  console.log("[DEBUG] JWT extraído:", jwt ? jwt.substring(0, 20) + "..." : "VAZIO");
  
  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  
  console.log("[DEBUG] Resultado da autenticação:", {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    error: error?.message
  });
  
  if (error || !user) {
    console.log("[ERROR] Erro de autenticação:", { error, user });
    return new Response(JSON.stringify({ 
      error: 'Não autorizado',
      debug: {
        hasAuthHeader: !!authHeader,
        jwtLength: jwt?.length || 0,
        errorMessage: error?.message,
        supabaseUrl,
        hasAnonKey: !!supabaseAnonKey
      }
    }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Se chegou aqui, a autenticação funcionou
  return new Response(JSON.stringify({ 
    success: true,
    user: {
      id: user.id,
      email: user.email
    },
    message: "Autenticação bem-sucedida!"
  }), {
    status: 200,
    headers: corsHeaders,
  });
});
