# Script para importar dados no Supabase local
Write-Host "Importando dados para o Supabase local..." -ForegroundColor Cyan

# Verifica se o arquivo de dados existe
if (-not (Test-Path "supabase\data.sql")) {
    Write-Host "ERRO: Arquivo supabase\data.sql nao encontrado!" -ForegroundColor Red
    exit 1
}

# Parâmetros de conexão do Postgres local (Supabase CLI)
$dbHost = "127.0.0.1"
$dbPort = "54322"
$database = "postgres"
$username = "postgres"
$password = "postgres"

# Variável de ambiente para senha (evita prompt)
$env:PGPASSWORD = $password

Write-Host "Executando importacao dos dados..." -ForegroundColor Yellow

# Tenta usar psql se disponível, senão usa docker
try {
    # Tenta psql primeiro
    psql -h $dbHost -p $dbPort -U $username -d $database -f "supabase\data.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCESSO: Dados importados com sucesso!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "AVISO: psql nao encontrado, tentando via Docker..." -ForegroundColor Yellow
}

# Se psql não funcionar, usa Docker com caminho correto
try {
    $containerName = "supabase_db_github-mktplace-v1"
    # Copia o arquivo para dentro do container primeiro
    docker cp "supabase\data.sql" "${containerName}:/tmp/data.sql"
    # Executa o SQL dentro do container
    docker exec -i $containerName psql -U postgres -d postgres -f "/tmp/data.sql"
    Write-Host "SUCESSO: Dados importados via Docker!" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Erro ao importar dados. Verifique se o Supabase local esta rodando." -ForegroundColor Red
    Write-Host "DICA: Execute npx supabase status" -ForegroundColor Cyan
}

# Remove a variável de ambiente
Remove-Item Env:PGPASSWORD
