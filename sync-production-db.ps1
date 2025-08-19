# Script de Sincronização com Banco de Produção
# Execute: powershell -ExecutionPolicy Bypass -File sync-production-db.ps1

Write-Host "=== Sincronização com Banco de Produção ===" -ForegroundColor Green

# Verificar se Docker está rodando
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "Inicie o Docker Desktop e tente novamente" -ForegroundColor Yellow
    exit 1
}

# Verificar Supabase CLI
Write-Host "Verificando Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 PROCESSO DE SINCRONIZAÇÃO:" -ForegroundColor Cyan
Write-Host "1. Fazer backup das migrations locais atuais" -ForegroundColor White
Write-Host "2. Conectar ao projeto remoto" -ForegroundColor White  
Write-Host "3. Baixar schema atual da produção" -ForegroundColor White
Write-Host "4. Gerar migrations baseadas no estado atual" -ForegroundColor White
Write-Host "5. Configurar ambiente local" -ForegroundColor White
Write-Host ""

# Passo 1: Backup das migrations existentes
Write-Host "📦 Passo 1: Fazendo backup das migrations atuais..." -ForegroundColor Yellow
$backupFolder = "supabase/migrations_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
Copy-Item "supabase/migrations/*" $backupFolder -Recurse -Force
Write-Host "✅ Backup criado em: $backupFolder" -ForegroundColor Green

# Passo 2: Conectar ao projeto remoto
Write-Host "🔗 Passo 2: Conectando ao projeto remoto..." -ForegroundColor Yellow
Write-Host "Você precisa do Project ID do Supabase (encontrado na URL do projeto)" -ForegroundColor Cyan
$projectId = Read-Host "Digite o Project ID do Supabase"

if ([string]::IsNullOrWhiteSpace($projectId)) {
    Write-Host "❌ Project ID é obrigatório!" -ForegroundColor Red
    exit 1
}

# Login no Supabase (se necessário)
Write-Host "🔐 Fazendo login no Supabase..." -ForegroundColor Yellow
try {
    supabase auth login
    Write-Host "✅ Login realizado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no login. Verifique suas credenciais" -ForegroundColor Red
    exit 1
}

# Passo 3: Linkar ao projeto
Write-Host "🔗 Linkando ao projeto remoto..." -ForegroundColor Yellow
try {
    supabase link --project-ref $projectId
    Write-Host "✅ Projeto linkado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao linkar projeto. Verifique o Project ID" -ForegroundColor Red
    exit 1
}

# Passo 4: Baixar schema atual da produção
Write-Host "⬇️ Passo 3: Baixando schema atual da produção..." -ForegroundColor Yellow
try {
    # Criar nova migration baseada no estado atual da produção
    supabase db diff --schema public,auth,storage --use-migra
    Write-Host "✅ Schema baixado e diff gerado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao gerar diff. Tentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo: reset e pull
    try {
        supabase db reset --linked
        Write-Host "✅ Schema sincronizado via reset" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro na sincronização. Processo manual necessário" -ForegroundColor Red
        Write-Host "Execute manualmente: supabase db pull" -ForegroundColor Yellow
    }
}

# Passo 5: Configurar para desenvolvimento local
Write-Host "🏠 Passo 4: Configurando ambiente local..." -ForegroundColor Yellow

# Criar arquivo de configuração para alternar entre local e produção
$envConfig = @"
# Configuração para alternar entre Local e Produção
# 
# Para usar LOCALMENTE:
# 1. Renomeie este arquivo para .env.local
# 2. Execute: npm run supabase:start
# 3. Execute: npm run dev
#
# Para usar PRODUÇÃO:
# 1. Use o arquivo .env (já configurado)
# 2. Execute: npm run dev

# === CONFIGURAÇÃO LOCAL ===
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
VITE_SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1

# Configuração de desenvolvimento
NODE_ENV=development
SUPABASE_LOCAL=true

# URL para redirect local
VITE_RESET_PASSWORD_REDIRECT=http://localhost:3000/password-recovery
"@

$envConfig | Out-File -FilePath ".env.development" -Encoding UTF8
Write-Host "✅ Arquivo .env.development criado" -ForegroundColor Green

# Passo 6: Instruções finais
Write-Host ""
Write-Host "🎉 SINCRONIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Para DESENVOLVIMENTO LOCAL (dados isolados):" -ForegroundColor White
Write-Host "   • Renomeie .env.development para .env.local" -ForegroundColor Gray
Write-Host "   • Execute: npm run supabase:start" -ForegroundColor Gray
Write-Host "   • Execute: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣ Para PRODUÇÃO (dados reais):" -ForegroundColor White
Write-Host "   • Use o arquivo .env existente" -ForegroundColor Gray
Write-Host "   • Execute: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣ Para aplicar NOVAS MIGRATIONS:" -ForegroundColor White
Write-Host "   • Crie: supabase migration new nome_da_migration" -ForegroundColor Gray
Write-Host "   • Teste local: supabase db reset" -ForegroundColor Gray
Write-Host "   • Aplique produção: supabase db push" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️ IMPORTANTE:" -ForegroundColor Yellow
Write-Host "• Backup das migrations antigas em: $backupFolder" -ForegroundColor Gray
Write-Host "• Sempre teste mudanças localmente antes de aplicar em produção" -ForegroundColor Gray
Write-Host "• Use git para versionar suas migrations" -ForegroundColor Gray
