// Test function to check if secrets are loaded correctly
// Based on: https://supabase.com/docs/guides/functions/secrets#using-the-cli

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Test secret access
    const secrets = {
      PAGARME: Deno.env.get('PAGARME') ? 'LOADED' : 'MISSING',
      PAGARME_PUBLIC_KEY: Deno.env.get('PAGARME_PUBLIC_KEY') ? 'LOADED' : 'MISSING', 
      RESEND_API_KEY: Deno.env.get('RESEND_API_KEY') ? 'LOADED' : 'MISSING',
      STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET') ? 'LOADED' : 'MISSING',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') || 'MISSING',
      SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ? 'LOADED' : 'MISSING'
    };

    return new Response(
      JSON.stringify({
        message: 'Secrets test completed',
        timestamp: new Date().toISOString(),
        secrets: secrets,
        note: 'Values showing "your_*_here" need to be replaced with real values'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
