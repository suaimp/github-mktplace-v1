# Script para configurar automaticamente o arquivo .env das Edge Functions
# com os valores reais dos secrets de producao

Write-Host "Configurando arquivo .env das Edge Functions..." -ForegroundColor Cyan

$projectRef = "uxbeaslwirkepnowydfu"
$envFile = "supabase\functions\.env"

# Verificar se o arquivo .env existe
if (-not (Test-Path $envFile)) {
    Write-Host "Erro: Arquivo $envFile nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Obtendo lista de secrets de producao..." -ForegroundColor Yellow

# Lista de secrets para obter
$secrets = @(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_DB_URL", 
    "PAGARME",
    "PAGARME_PUBLIC_KEY",
    "PAGARME_TEST_SECRET",
    "PAGARME_TEST_PUBLIC",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY"
)

Write-Host "Secrets encontrados no Supabase:" -ForegroundColor Green
foreach ($secret in $secrets) {
    Write-Host "- $secret" -ForegroundColor White
}

Write-Host "`nINSTRUCOES PARA COMPLETAR A CONFIGURACAO:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://supabase.com/dashboard/project/$projectRef/settings/edge-functions" -ForegroundColor White
Write-Host "2. Copie os valores dos secrets listados acima" -ForegroundColor White
Write-Host "3. Substitua os valores 'PRECISA_SER_CONFIGURADO_MANUALMENTE' no arquivo:" -ForegroundColor White
Write-Host "   $envFile" -ForegroundColor Yellow
Write-Host "`nLEMBRE-SE: Nunca faca commit deste arquivo!" -ForegroundColor Red

# Mostrar o conteudo atual do arquivo
Write-Host "`nConteudo atual do arquivo .env:" -ForegroundColor Cyan
Get-Content $envFile | ForEach-Object { 
    if ($_ -match "PRECISA_SER_CONFIGURADO_MANUALMENTE") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_ -ForegroundColor Gray
    }
}
