# Script para configurar secrets das Edge Functions
# Para obter os valores reais, acesse: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions

Write-Host "Configurando Edge Functions Secrets..." -ForegroundColor Green

# Criar arquivo .env para as functions se não existir
$functionsEnvPath = "supabase\functions\.env"
$envContent = @"
# Edge Functions Secrets - Obtidos do Supabase Dashboard
# Acesse: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions

# Supabase Configuration
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_DB_URL=sua_db_url_aqui

# Payment Providers
PAGARME=sua_pagarme_secret_key_aqui
PAGARME_PUBLIC_KEY=sua_pagarme_public_key_aqui
PAGARME_TEST_SECRET=sua_pagarme_test_secret_aqui
PAGARME_TEST_PUBLIC=sua_pagarme_test_public_aqui

# External Services
STRIPE_WEBHOOK_SECRET=seu_stripe_webhook_secret_aqui
RESEND_API_KEY=sua_resend_api_key_aqui
"@

# Criar diretório se não existir
if (!(Test-Path "supabase\functions")) {
    New-Item -ItemType Directory -Path "supabase\functions" -Force
}

# Criar arquivo .env
$envContent | Out-File -FilePath $functionsEnvPath -Encoding utf8

Write-Host "Template criado em: $functionsEnvPath" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Acesse o dashboard: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions" -ForegroundColor White
Write-Host "2. Copie os valores das secrets e substitua no arquivo .env" -ForegroundColor White
Write-Host "3. Execute: supabase functions serve para testar localmente" -ForegroundColor White
Write-Host ""

# Listar secrets disponíveis
Write-Host "Secrets disponíveis em produção:" -ForegroundColor Cyan
supabase secrets list

Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "Os valores das secrets só podem ser obtidos via dashboard por questões de segurança." -ForegroundColor White
Write-Host "O CLI só mostra hashes das secrets, não os valores reais." -ForegroundColor White
