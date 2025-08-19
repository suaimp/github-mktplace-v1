# Script para configurar secrets locais das Edge Functions
# Voce precisa preencher os valores das secrets de producao

# Para obter os valores das secrets de producao:
# 1. Va ao Supabase Dashboard: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions
# 2. Copie os valores das secrets e cole abaixo

Write-Host "Configurando secrets locais para Edge Functions..." -ForegroundColor Green
Write-Host ""

# Lista de secrets necessarias
$secrets = @{
    "PAGARME" = "Cole_aqui_o_valor_da_secret_PAGARME_de_producao"
    "PAGARME_PUBLIC_KEY" = "Cole_aqui_o_valor_da_secret_PAGARME_PUBLIC_KEY_de_producao"
    "PAGARME_TEST_PUBLIC" = "Cole_aqui_o_valor_da_secret_PAGARME_TEST_PUBLIC_de_producao" 
    "PAGARME_TEST_SECRET" = "Cole_aqui_o_valor_da_secret_PAGARME_TEST_SECRET_de_producao"
    "RESEND_API_KEY" = "Cole_aqui_o_valor_da_secret_RESEND_API_KEY_de_producao"
    "STRIPE_WEBHOOK_SECRET" = "Cole_aqui_o_valor_da_secret_STRIPE_WEBHOOK_SECRET_de_producao"
    "SUPABASE_ANON_KEY" = "Cole_aqui_o_valor_da_secret_SUPABASE_ANON_KEY_de_producao"
    "SUPABASE_DB_URL" = "Cole_aqui_o_valor_da_secret_SUPABASE_DB_URL_de_producao"
    "SUPABASE_SERVICE_ROLE_KEY" = "Cole_aqui_o_valor_da_secret_SUPABASE_SERVICE_ROLE_KEY_de_producao"
    "SUPABASE_URL" = "Cole_aqui_o_valor_da_secret_SUPABASE_URL_de_producao"
}

# Criar arquivo .env para as Edge Functions
$envContent = ""
foreach ($secret in $secrets.GetEnumerator()) {
    $envContent += "$($secret.Name)=$($secret.Value)`n"
}

# Criar diretorio se nao existir
$functionsDir = "supabase\functions"
if (!(Test-Path $functionsDir)) {
    New-Item -ItemType Directory -Path $functionsDir -Force
}

# Escrever arquivo .env
$envPath = Join-Path $functionsDir ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "Arquivo de secrets criado em: $envPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "1. Edite o arquivo $envPath" -ForegroundColor White  
Write-Host "2. Substitua 'Cole_aqui_o_valor_da_secret_' pelos valores reais de producao" -ForegroundColor White
Write-Host "3. Reinicie as Edge Functions: Ctrl+C e depois execute novamente 'supabase functions serve'" -ForegroundColor White
Write-Host ""
Write-Host "Para obter os valores das secrets:" -ForegroundColor Cyan
Write-Host "Vá em: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions" -ForegroundColor Blue
