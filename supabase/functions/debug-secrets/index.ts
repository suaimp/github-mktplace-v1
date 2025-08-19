import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("=== DEBUG SECRETS ===");
    
    // Lista de todas as secrets conhecidas
    const secretNames = [
      'PAGARME',
      'PAGARME_PUBLIC_KEY',
      'PAGARME_TEST_PUBLIC',
      'PAGARME_TEST_SECRET',
      'RESEND_API_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SUPABASE_ANON_KEY',
      'SUPABASE_DB_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_URL'
    ];

    const secrets: Record<string, any> = {};
    const secretsStatus: Record<string, string> = {};

    // Verificar cada secret
    for (const secretName of secretNames) {
      const value = Deno.env.get(secretName);
      
      if (value) {
        // Para logs, mostrar apenas os primeiros e últimos caracteres por segurança
        const maskedValue = value.length > 10 
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
          : '***';
        
        console.log(`✅ ${secretName}: ${maskedValue} (length: ${value.length})`);
        
        secrets[secretName] = maskedValue;
        secretsStatus[secretName] = 'PRESENTE';
      } else {
        console.log(`❌ ${secretName}: NÃO ENCONTRADO`);
        secrets[secretName] = null;
        secretsStatus[secretName] = 'AUSENTE';
      }
    }

    // Verificar todas as variáveis de ambiente disponíveis
    console.log("\n=== TODAS AS VARIÁVEIS DE AMBIENTE ===");
    const allEnvVars: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(Deno.env.toObject())) {
      const maskedValue = value && value.length > 10 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value || 'undefined';
      
      console.log(`${key}: ${maskedValue}`);
      allEnvVars[key] = maskedValue;
    }

    // Contar secrets presentes vs ausentes
    const presentCount = Object.values(secretsStatus).filter(status => status === 'PRESENTE').length;
    const totalCount = secretNames.length;

    console.log(`\n=== RESUMO ===`);
    console.log(`Secrets configuradas: ${presentCount}/${totalCount}`);
    console.log(`Secrets ausentes: ${totalCount - presentCount}`);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total: totalCount,
        present: presentCount,
        missing: totalCount - presentCount
      },
      secrets: secretsStatus,
      maskedValues: secrets,
      allEnvVars: allEnvVars,
      message: `Debug completo realizado. ${presentCount}/${totalCount} secrets encontradas.`
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Erro ao debugar secrets:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
