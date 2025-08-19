# Convert secrets list to proper .env format
# Based on: https://supabase.com/docs/guides/functions/secrets#using-the-cli

Write-Host "🔑 Configurando secrets para Edge Functions locais..." -ForegroundColor Green

# Get secrets in raw format
$secretsOutput = & supabase secrets list 

# Parse and create .env content
$envContent = @"
# Edge Functions Environment Variables
# Downloaded from production on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# 
# ⚠️  SENSITIVE DATA - DO NOT COMMIT TO GIT!
# Add this file to .gitignore

"@

# Manually add the actual secret values (you'll need to get these from Dashboard)
# For now, let's create the structure
$envContent += @"

# === PAYMENT SECRETS ===
PAGARME=your_pagarme_secret_key_here
PAGARME_PUBLIC_KEY=your_pagarme_public_key_here
PAGARME_TEST_PUBLIC=your_pagarme_test_public_key_here
PAGARME_TEST_SECRET=your_pagarme_test_secret_key_here

# === EMAIL SECRETS ===
RESEND_API_KEY=your_resend_api_key_here

# === WEBHOOK SECRETS ===
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# === SUPABASE SECRETS (Auto-configured) ===
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

"@

# Save to .env.local file
$envFile = "supabase\functions\.env.local"
$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "✅ Arquivo criado: $envFile" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo .env.local e substitua os valores 'your_*_here' pelos valores reais" -ForegroundColor White
Write-Host "2. Os valores estão no Dashboard: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions" -ForegroundColor White
Write-Host "3. Teste as funções com: supabase functions serve --env-file .env.local" -ForegroundColor White
Write-Host ""
Write-Host "🔒 IMPORTANTE: Adicione .env.local ao .gitignore!" -ForegroundColor Red
