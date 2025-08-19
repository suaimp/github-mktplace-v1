# Script para importar dados no Supabase local
Write-Host "🚀 Importando dados para o Supabase local..." -ForegroundColor Cyan

# Verifica se o arquivo de dados existe
if (-not (Test-Path "supabase\data.sql")) {
    Write-Host "❌ Arquivo supabase\data.sql não encontrado!" -ForegroundColor Red
    exit 1
}

# Parâmetros de conexão do Postgres local (Supabase CLI)
$host = "127.0.0.1"
$port = "54322"
$database = "postgres"
$username = "postgres"
$password = "postgres"

# Variável de ambiente para senha (evita prompt)
$env:PGPASSWORD = $password

Write-Host "📊 Executando importação dos dados..." -ForegroundColor Yellow

# Tenta usar psql se disponível, senão usa docker
try {
    # Tenta psql primeiro
    psql -h $host -p $port -U $username -d $database -f "supabase\data.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dados importados com sucesso!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "⚠️ psql não encontrado, tentando via Docker..." -ForegroundColor Yellow
}

# Se psql não funcionar, usa Docker
try {
    $containerName = "supabase_db_github-mktplace-v1"
    docker exec -i $containerName psql -U postgres -d postgres -c "\i /var/lib/postgresql/data.sql"
    Write-Host "✅ Dados importados via Docker!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao importar dados. Verifique se o Supabase local está rodando." -ForegroundColor Red
    Write-Host "💡 Execute: npx supabase status" -ForegroundColor Cyan
}

# Remove a variável de ambiente
Remove-Item Env:PGPASSWORD
