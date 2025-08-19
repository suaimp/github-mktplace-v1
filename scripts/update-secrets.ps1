# Script para atualizar secrets das Edge Functions
# IMPORTANTE: Você precisa obter os valores reais das secrets do dashboard do Supabase
# https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions

Write-Host "=== CONFIGURAÇÃO DE SECRETS PARA EDGE FUNCTIONS ===" -ForegroundColor Green

$envPath = "supabase\functions\.env"

Write-Host "`nArquivo atual: $envPath" -ForegroundColor Yellow

# Verificar se o arquivo existe
if (Test-Path $envPath) {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Mostrar secrets que estão faltando
    $currentContent = Get-Content $envPath -Raw
    
    $missingSecrets = @()
    
    if ($currentContent -notmatch "PAGARME=") {
        $missingSecrets += "PAGARME"
    }
    if ($currentContent -notmatch "PAGARME_PUBLIC_KEY=") {
        $missingSecrets += "PAGARME_PUBLIC_KEY"
    }
    if ($currentContent -notmatch "PAGARME_TEST_PUBLIC=") {
        $missingSecrets += "PAGARME_TEST_PUBLIC"
    }
    if ($currentContent -notmatch "PAGARME_TEST_SECRET=") {
        $missingSecrets += "PAGARME_TEST_SECRET"
    }
    if ($currentContent -notmatch "RESEND_API_KEY=") {
        $missingSecrets += "RESEND_API_KEY"
    }
    if ($currentContent -notmatch "STRIPE_WEBHOOK_SECRET=") {
        $missingSecrets += "STRIPE_WEBHOOK_SECRET"
    }
    
    if ($missingSecrets.Count -gt 0) {
        Write-Host "`n⚠️  Secrets que estão faltando:" -ForegroundColor Red
        foreach ($secret in $missingSecrets) {
            Write-Host "   - $secret" -ForegroundColor Red
        }
        
        Write-Host "`n📋 Para adicionar as secrets:" -ForegroundColor Yellow
        Write-Host "1. Vá para: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions" -ForegroundColor Cyan
        Write-Host "2. Copie os valores das secrets" -ForegroundColor Cyan
        Write-Host "3. Adicione no arquivo supabase\functions\.env" -ForegroundColor Cyan
        Write-Host "`nExemplo de formato:" -ForegroundColor Yellow
        Write-Host "PAGARME=sk_test_..." -ForegroundColor Gray
        Write-Host "RESEND_API_KEY=re_..." -ForegroundColor Gray
        
    } else {
        Write-Host "✅ Todas as secrets estão configuradas" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
    Write-Host "Execute primeiro: supabase start" -ForegroundColor Yellow
}

Write-Host "`n🔧 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure as secrets faltantes" -ForegroundColor Cyan
Write-Host "2. Execute: supabase start" -ForegroundColor Cyan
Write-Host "3. Teste as funções" -ForegroundColor Cyan
