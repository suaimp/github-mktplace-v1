# Lista de todas as Edge Functions em produção
$functions = @(
    "smtp-test",
    "test-smtp", 
    "create-payment-intent",
    "stripe-webhook",
    "create-pix-qrcode",
    "send-order-email",
    "delete-user",
    "feedback-email",
    "pagarme-payment",
    "test-auth",
    "pagarme-pix-payment",
    "pagarme-pix-status",
    "test-pix-simple",
    "pagarme-pix-webhook",
    "pagarme-installments",
    "send-order-notification-email"
)

# Diretório onde as funções serão salvas
$functions_dir = "supabase\functions"

# Verifica se o diretório existe
if (!(Test-Path $functions_dir)) {
    New-Item -ItemType Directory -Path $functions_dir -Force
    Write-Host "Diretório $functions_dir criado."
}

Write-Host "Iniciando download de todas as Edge Functions..." -ForegroundColor Green

# Itera sobre cada função e a baixa
foreach ($func in $functions) {
    $funcPath = Join-Path $functions_dir $func
    
    if (Test-Path $funcPath) {
        Write-Host "EXISTE: $func ja existe localmente" -ForegroundColor Yellow
    } else {
        Write-Host "BAIXANDO: $func..." -ForegroundColor Blue
        try {
            & npx supabase functions download $func
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "SUCESSO: $func baixada com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "ERRO: Erro ao baixar $func" -ForegroundColor Red
            }
        } catch {
            Write-Host "ERRO: Erro ao baixar $func - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Download completo!" -ForegroundColor Green
Write-Host "Verificando funcoes baixadas..." -ForegroundColor Blue

# Lista as funções baixadas
$downloadedFunctions = Get-ChildItem -Path $functions_dir -Directory | Select-Object -ExpandProperty Name
Write-Host "Funcoes locais:" -ForegroundColor Cyan
foreach ($downloaded in $downloadedFunctions) {
    Write-Host "   OK: $downloaded" -ForegroundColor Green
}

Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute: npx supabase stop" -ForegroundColor White
Write-Host "2. Execute: npx supabase start" -ForegroundColor White
Write-Host "3. Verifique as funcoes no Studio: http://127.0.0.1:54323" -ForegroundColor White
