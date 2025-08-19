import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("=== FETCH PRODUCTION SECRETS ===");
    
    // Conectar ao Supabase de produção usando as credentials disponíveis
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados');
    }

    console.log('Conectando ao Supabase:', supabaseUrl);
    
    // Esta função está rodando na produção, então pode acessar as secrets de lá
    const productionSecrets = {
      PAGARME: Deno.env.get('PAGARME'),
      PAGARME_PUBLIC_KEY: Deno.env.get('PAGARME_PUBLIC_KEY'),
      PAGARME_TEST_PUBLIC: Deno.env.get('PAGARME_TEST_PUBLIC'),
      PAGARME_TEST_SECRET: Deno.env.get('PAGARME_TEST_SECRET'),
      RESEND_API_KEY: Deno.env.get('RESEND_API_KEY'),
      STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET')
    };

    // Gerar formato .env para copiar
    let envFormat = '# SECRETS OBTIDAS DA PRODUÇÃO\n';
    let foundSecrets = 0;
    
    for (const [key, value] of Object.entries(productionSecrets)) {
      if (value) {
        envFormat += `${key}=${value}\n`;
        foundSecrets++;
        console.log(`✅ ${key}: ${value.substring(0, 8)}...`);
      } else {
        envFormat += `# ${key}=NÃO_ENCONTRADO\n`;
        console.log(`❌ ${key}: não encontrado`);
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: `${foundSecrets} secrets encontradas na produção`,
      envFormat: envFormat,
      secrets: productionSecrets,
      instructions: [
        '1. Copie o conteúdo de envFormat',
        '2. Cole no arquivo supabase/functions/.env local',
        '3. Execute: supabase stop && supabase start',
        '4. Teste suas Edge Functions'
      ]
    };

    console.log('=== RESULTADO ===');
    console.log(`Secrets encontradas: ${foundSecrets}/6`);
    console.log('Formato .env gerado com sucesso');

    return new Response(JSON.stringify(response, null, 2), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Erro ao buscar secrets:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      note: 'Esta função deve ser executada na produção para acessar as secrets'
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
