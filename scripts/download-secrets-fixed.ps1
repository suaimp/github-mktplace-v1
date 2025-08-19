# Script para baixar secrets de producao para desenvolvimento local
Write-Host "Baixando secrets de producao para desenvolvimento local..." -ForegroundColor Green

# Criar diretorio se nao existir
$functionsDir = "supabase\functions"
if (!(Test-Path $functionsDir)) {
    New-Item -ItemType Directory -Path $functionsDir -Force
}

# Lista de secrets para baixar
$secrets = @(
    "PAGARME",
    "PAGARME_PUBLIC_KEY", 
    "PAGARME_TEST_PUBLIC",
    "PAGARME_TEST_SECRET",
    "RESEND_API_KEY",
    "STRIPE_WEBHOOK_SECRET"
)

Write-Host "Criando arquivo .env.local com secrets..." -ForegroundColor Yellow

# Criar arquivo .env.local
$envContent = @"
# Edge Functions Secrets - Downloaded from Production
# Generated on $(Get-Date)
# 
# IMPORTANTE: Este arquivo contem dados sensiveis!
# Nunca faca commit deste arquivo no Git!

# Configuracao para desenvolvimento local
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

"@

foreach ($secret in $secrets) {
    Write-Host "  Processando $secret..." -ForegroundColor Cyan
    try {
        # Executar comando para obter o valor da secret
        $result = & npx supabase secrets list --format=env | Select-String "^$secret="
        if ($result) {
            $envContent += "`n$result"
            Write-Host "    SUCESSO: $secret adicionado" -ForegroundColor Green
        } else {
            Write-Host "    AVISO: $secret nao encontrado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    ERRO: Erro ao obter $secret" -ForegroundColor Red
    }
}

# Salvar arquivo
$envFile = "$functionsDir\.env.local"
$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host ""
Write-Host "SUCESSO: Arquivo criado: $envFile" -ForegroundColor Green
Write-Host "Como usar:" -ForegroundColor Cyan
Write-Host "   npx supabase functions serve --env-file .env.local" -ForegroundColor White
Write-Host "   ou" -ForegroundColor Gray
Write-Host "   npx supabase functions serve hello-world --env-file .env.local" -ForegroundColor White

Write-Host ""
Write-Host "LEMBRE-SE: Adicione .env.local ao .gitignore!" -ForegroundColor Red
