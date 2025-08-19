# Script para configurar secrets faltantes no arquivo .env das Edge Functions
# Este script adicionará as secrets de produção ao arquivo local

$envPath = "supabase\functions\.env"

Write-Host "🔐 CONFIGURANDO SECRETS PARA EDGE FUNCTIONS" -ForegroundColor Green
Write-Host "Arquivo: $envPath" -ForegroundColor Yellow

# Backup do arquivo atual
if (Test-Path $envPath) {
    Copy-Item $envPath "$envPath.backup" -Force
    Write-Host "✅ Backup criado: $envPath.backup" -ForegroundColor Green
}

# Secrets que precisam ser adicionadas (valores fictícios para exemplo)
# IMPORTANTE: Substitua pelos valores reais do dashboard
$additionalSecrets = @"

# === SECRETS ADICIONADAS AUTOMATICAMENTE ===
# IMPORTANTE: Substitua pelos valores reais do Supabase Dashboard
# https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions

# Pagar.me Secrets
PAGARME=sk_test_SUBSTITUA_PELO_VALOR_REAL
PAGARME_PUBLIC_KEY=pk_test_SUBSTITUA_PELO_VALOR_REAL
PAGARME_TEST_PUBLIC=pk_test_SUBSTITUA_PELO_VALOR_REAL
PAGARME_TEST_SECRET=sk_test_SUBSTITUA_PELO_VALOR_REAL

# Resend API
RESEND_API_KEY=re_SUBSTITUA_PELO_VALOR_REAL

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_SUBSTITUA_PELO_VALOR_REAL

"@

# Adicionar as secrets ao arquivo
Add-Content -Path $envPath -Value $additionalSecrets -Encoding UTF8

Write-Host "✅ Secrets adicionadas ao arquivo!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Abra o arquivo: $envPath" -ForegroundColor Cyan
Write-Host "2. Substitua os valores 'SUBSTITUA_PELO_VALOR_REAL' pelos valores reais" -ForegroundColor Cyan
Write-Host "3. Obtenha os valores em: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions" -ForegroundColor Cyan
Write-Host "4. Execute: supabase stop && supabase start" -ForegroundColor Cyan
Write-Host "5. Teste novamente: debug-secrets" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  LEMBRE-SE: Nunca faça commit dos valores reais das secrets!" -ForegroundColor Red
