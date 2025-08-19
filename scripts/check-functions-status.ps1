# Script para Recriar Edge Functions no Supabase Studio

$functions = @(
    "create-payment-intent",
    "create-pix-qrcode", 
    "delete-user",
    "feedback-email",
    "pagarme-installments",
    "pagarme-payment",
    "pagarme-pix-payment",
    "pagarme-pix-status",
    "pagarme-pix-webhook",
    "pagarme-webhook",
    "send-order-email",
    "send-order-notification-email",
    "smtp-test",
    "stripe-webhook",
    "test-auth",
    "test-pix-simple",
    "test-smtp"
)

Write-Host "🚀 Iniciando recriacao manual das Edge Functions..." -ForegroundColor Green

foreach ($func in $functions) {
    Write-Host ""
    Write-Host "📝 Processando: $func" -ForegroundColor Blue
    
    $funcPath = "supabase\functions\$func"
    
    if (Test-Path $funcPath) {
        Write-Host "✅ Funcao $func ja existe localmente" -ForegroundColor Yellow
        
        # Ler o arquivo index.ts
        $indexPath = "$funcPath\index.ts"
        if (Test-Path $indexPath) {
            Write-Host "📄 Arquivo index.ts encontrado" -ForegroundColor Green
            
            # Mostrar primeiras linhas para verificacao
            $content = Get-Content $indexPath -TotalCount 5
            Write-Host "Primeiras linhas:" -ForegroundColor Cyan
            $content | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    } else {
        Write-Host "❌ Funcao $func NAO encontrada localmente" -ForegroundColor Red
        Write-Host "   Sera necessario recriar manualmente no Studio" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 RESUMO DAS FUNCOES:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

$existingFunctions = @()
$missingFunctions = @()

foreach ($func in $functions) {
    if (Test-Path "supabase\functions\$func") {
        $existingFunctions += $func
    } else {
        $missingFunctions += $func
    }
}

Write-Host "✅ Funcoes EXISTENTES ($($existingFunctions.Count)):" -ForegroundColor Green
$existingFunctions | ForEach-Object { Write-Host "   - $_" -ForegroundColor Green }

if ($missingFunctions.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Funcoes FALTANDO ($($missingFunctions.Count)):" -ForegroundColor Red
    $missingFunctions | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "🔐 SECRETS NECESSARIAS:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host "PAGARME=sua_chave_pagarme" -ForegroundColor White
Write-Host "PAGARME_PUBLIC_KEY=sua_chave_publica" -ForegroundColor White
Write-Host "PAGARME_TEST_PUBLIC=sua_chave_teste_publica" -ForegroundColor White
Write-Host "PAGARME_TEST_SECRET=sua_chave_teste_secreta" -ForegroundColor White
Write-Host "RESEND_API_KEY=sua_chave_resend" -ForegroundColor White
Write-Host "STRIPE_WEBHOOK_SECRET=sua_webhook_secret_stripe" -ForegroundColor White
Write-Host "SUPABASE_ANON_KEY=sua_chave_anonima_producao" -ForegroundColor White
Write-Host "SUPABASE_DB_URL=sua_url_banco_producao" -ForegroundColor White
Write-Host "SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_producao" -ForegroundColor White
Write-Host "SUPABASE_URL=sua_url_projeto_producao" -ForegroundColor White

Write-Host ""
Write-Host "📝 PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "1. Acesse o Supabase Studio: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Va para Edge Functions" -ForegroundColor White
Write-Host "3. Para cada funcao faltando, clique em 'New Function'" -ForegroundColor White
Write-Host "4. Copie o codigo do arquivo local correspondente" -ForegroundColor White
Write-Host "5. Configure as secrets em Settings > Edge Functions" -ForegroundColor White

Write-Host ""
Write-Host "🎯 FUNCOES PRIORITARIAS (webhooks):" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red
Write-Host "- stripe-webhook (receber pagamentos Stripe)" -ForegroundColor White
Write-Host "- pagarme-webhook (receber pagamentos Pagar.me)" -ForegroundColor White
Write-Host "- pagarme-pix-webhook (receber notificacoes PIX)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Webhooks devem ter 'verify_jwt' = false" -ForegroundColor Yellow
