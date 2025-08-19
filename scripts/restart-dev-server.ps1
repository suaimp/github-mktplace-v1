# Script para reiniciar o servidor de desenvolvimento com variáveis atualizadas
Write-Host "🔄 REINICIANDO SERVIDOR DE DESENVOLVIMENTO" -ForegroundColor Green

# Verificar se o arquivo .env.local existe
if (Test-Path ".env.local") {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
    Write-Host "📋 Variáveis configuradas:" -ForegroundColor Yellow
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^VITE_") {
            $varName = ($_ -split "=")[0]
            Write-Host "   - $varName" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Arquivo .env.local não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🛑 Parando processos na porta 5173..." -ForegroundColor Yellow

# Parar processo na porta 5173 (Vite)
$processes = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        $processId = (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Id
        if ($processId) {
            Write-Host "Parando processo ID: $processId" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "📍 As variáveis de ambiente serão carregadas automaticamente" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 O servidor estará disponível em: http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 DICA: Após iniciar, verifique no console do navegador se não há mais o erro:" -ForegroundColor Yellow
Write-Host "   'Missing Supabase environment variables'" -ForegroundColor Gray
Write-Host ""

# Iniciar o servidor
npm run dev com as novas variáveis de ambiente

Write-Host "🔄 REINICIANDO SERVIDOR DE DESENVOLVIMENTO" -ForegroundColor Green

# Verificar se o arquivo .env.local existe
if (Test-Path ".env.local") {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
    
    # Mostrar as variáveis configuradas
    Write-Host "`n📋 Variáveis de ambiente configuradas:" -ForegroundColor Yellow
    Get-Content ".env.local" | Where-Object { $_ -match "^VITE_" } | ForEach-Object {
        $parts = $_ -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0]
            $value = $parts[1]
            if ($value.Length -gt 20) {
                $maskedValue = $value.Substring(0, 10) + "..." + $value.Substring($value.Length - 5)
            } else {
                $maskedValue = $value
            }
            Write-Host "   $key = $maskedValue" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Arquivo .env.local não encontrado!" -ForegroundColor Red
    Write-Host "Criando arquivo .env.local..." -ForegroundColor Yellow
    
    $envContent = @"
# Configuracao do Supabase Local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
VITE_SUPABASE_FUNCTIONS_URL=http://127.0.0.1:54321/functions/v1
VITE_RESET_PASSWORD_REDIRECT=http://localhost:3000/password-recovery
NODE_ENV=development
SUPABASE_LOCAL=true
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
}

Write-Host "`n🚀 INSTRUÇÕES PARA REINICIAR:" -ForegroundColor Yellow
Write-Host "1. Pare o servidor atual (Ctrl+C no terminal onde npm/yarn está rodando)" -ForegroundColor Cyan
Write-Host "2. Execute um dos comandos abaixo:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   # ou" -ForegroundColor Gray
Write-Host "   yarn dev" -ForegroundColor White
Write-Host "   # ou" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor White
Write-Host "`n💡 As variáveis de ambiente serão carregadas automaticamente!" -ForegroundColor Green

# Verificar se há processos na porta 5173
$port5173 = netstat -an | findstr ":5173"
if ($port5173) {
    Write-Host "`n⚠️  Servidor ainda está rodando na porta 5173!" -ForegroundColor Red
    Write-Host "   Para parar: pressione Ctrl+C no terminal do servidor" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Porta 5173 livre - pronto para reiniciar!" -ForegroundColor Green
}
