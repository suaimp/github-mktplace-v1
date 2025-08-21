# Script de configuração do Supabase Local
# Execute: powershell -ExecutionPolicy Bypass -File setup-supabase-local.ps1

Write-Host "=== Configuração do Supabase Local ===" -ForegroundColor Green

# Verificar se Docker está instalado
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
    Write-Host "Instale o Docker Desktop em: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker está rodando
Write-Host "Verificando se Docker está rodando..." -ForegroundColor Yellow
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
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Inicializar Supabase se não estiver inicializado
Write-Host "Inicializando Supabase..." -ForegroundColor Yellow
if (!(Test-Path "supabase/.gitignore")) {
    supabase init
    Write-Host "✅ Supabase inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Supabase já está inicializado" -ForegroundColor Green
}

# Criar arquivo .env.local se não existir
Write-Host "Configurando arquivo .env.local..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Write-Host "✅ Arquivo .env.local criado" -ForegroundColor Green
} else {
    Write-Host "✅ Arquivo .env.local já existe" -ForegroundColor Green
}

# Tentar iniciar o Supabase
Write-Host "Iniciando Supabase local..." -ForegroundColor Yellow
try {
    supabase start
    Write-Host "✅ Supabase local iniciado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
    Write-Host "Acesse: http://localhost:54321" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos úteis:" -ForegroundColor Yellow
    Write-Host "  npm run supabase:status  - Ver status" -ForegroundColor Gray
    Write-Host "  npm run supabase:stop    - Parar serviços" -ForegroundColor Gray
    Write-Host "  npm run dev:local        - Desenvolver com Supabase local" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao iniciar Supabase" -ForegroundColor Red
    Write-Host "Verifique os logs e tente: supabase start --debug" -ForegroundColor Yellow
}
