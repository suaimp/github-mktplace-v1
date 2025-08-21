# Script para configurar automaticamente o arquivo .env das Edge Functions
# com os valores reais dos secrets de produção

Write-Host "🔧 Configurando arquivo .env das Edge Functions..." -ForegroundColor Cyan

$projectRef = "uxbeaslwirkepnowydfu"
$envFile = "supabase\functions\.env"

# Verificar se o arquivo .env existe
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Arquivo $envFile não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Obtendo secrets de produção..." -ForegroundColor Yellow

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

# Obter cada secret e substituir no arquivo
foreach ($secret in $secrets) {
    Write-Host "🔐 Obtendo $secret..." -ForegroundColor Gray
    
    try {
        # Usar o comando supabase para obter o valor do secret
        $output = & supabase secrets list --project-ref $projectRef -o json 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            # Parsear o JSON e encontrar o secret
            $secretsData = $output | ConvertFrom-Json
            $secretEntry = $secretsData | Where-Object { $_.name -eq $secret }
            
            if ($secretEntry) {
                Write-Host "✅ Secret $secret encontrado" -ForegroundColor Green
                # Nota: O valor real não é retornado por segurança
                # Vamos marcar como encontrado para configuração manual
            } else {
                Write-Host "⚠️ Secret $secret não encontrado" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "❌ Erro ao obter $secret`: $_" -ForegroundColor Red
    }
}

Write-Host "`n📝 INSTRUCOES PARA COMPLETAR A CONFIGURACAO:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://supabase.com/dashboard/project/$projectRef/settings/edge-functions" -ForegroundColor White
Write-Host "2. Copie os valores dos secrets listados acima" -ForegroundColor White
Write-Host "3. Substitua os valores 'PRECISA_SER_CONFIGURADO_MANUALMENTE' no arquivo:" -ForegroundColor White
Write-Host "   $envFile" -ForegroundColor Yellow
Write-Host "`n🔒 LEMBRE-SE: Nunca faca commit deste arquivo!" -ForegroundColor Red

# Mostrar o conteudo atual do arquivo
Write-Host "`n📄 Conteudo atual do arquivo .env:" -ForegroundColor Cyan
Get-Content $envFile | ForEach-Object { 
    if ($_ -match "PRECISA_SER_CONFIGURADO_MANUALMENTE") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_ -ForegroundColor Gray
    }
}
