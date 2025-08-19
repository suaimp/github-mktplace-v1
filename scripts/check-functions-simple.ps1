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

Write-Host "Verificando Edge Functions..." -ForegroundColor Green

$existingFunctions = @()
$missingFunctions = @()

foreach ($func in $functions) {
    if (Test-Path "supabase\functions\$func") {
        $existingFunctions += $func
        Write-Host "✅ $func - EXISTE" -ForegroundColor Green
    } else {
        $missingFunctions += $func
        Write-Host "❌ $func - FALTANDO" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "RESUMO:" -ForegroundColor Cyan
Write-Host "Existentes: $($existingFunctions.Count)" -ForegroundColor Green
Write-Host "Faltando: $($missingFunctions.Count)" -ForegroundColor Red

if ($missingFunctions.Count -gt 0) {
    Write-Host ""
    Write-Host "Funcoes que precisam ser recriadas:" -ForegroundColor Yellow
    $missingFunctions | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}
