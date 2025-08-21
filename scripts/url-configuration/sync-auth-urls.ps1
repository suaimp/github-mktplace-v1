# Sync Auth URLs - Supabase Local Configuration
# Script para sincronizar URLs de autenticação do Supabase para ambiente local
# Autor: Sistema de Marketplace
# Data: $(Get-Date -Format "yyyy-MM-dd")

param(
    [switch]$Force = $false,
    [switch]$SkipRestart = $false,
    [string]$SiteUrl = "http://localhost:3000"
)

# Configurações
$ConfigPath = "supabase\config.toml"
$BackupPath = "supabase\config.toml.backup"

# URLs locais para desenvolvimento
$LocalUrls = @(
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://localhost:3000/password-recovery",
    "http://localhost:5173/password-recovery",
    "http://localhost:5174/password-recovery", 
    "http://localhost:3000/reset-password",
    "http://localhost:5173/reset-password",
    "http://localhost:5174/reset-password"
)

function Write-ColorOutput {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Test-SupabaseRunning {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:54321/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Backup-Config {
    if (Test-Path $ConfigPath) {
        Copy-Item $ConfigPath $BackupPath -Force
        Write-ColorOutput "📋 Backup criado: $BackupPath" "Yellow"
        return $true
    }
    return $false
}

function Update-AuthConfig {
    param(
        [string]$ConfigFile,
        [string]$SiteUrl,
        [string[]]$RedirectUrls
    )
    
    if (-not (Test-Path $ConfigFile)) {
        Write-ColorOutput "❌ Arquivo config.toml não encontrado: $ConfigFile" "Red"
        return $false
    }
    
    try {
        $content = Get-Content $ConfigFile -Raw
        
        # Atualizar site_url
        $content = $content -replace 'site_url\s*=\s*"[^"]*"', "site_url = `"$SiteUrl`""
        
        # Preparar array de URLs para config.toml
        $urlArray = ($RedirectUrls | ForEach-Object { "`"$_`"" }) -join ", "
        
        # Atualizar ou adicionar additional_redirect_urls
        if ($content -match 'additional_redirect_urls\s*=\s*\[[^\]]*\]') {
            $content = $content -replace 'additional_redirect_urls\s*=\s*\[[^\]]*\]', "additional_redirect_urls = [$urlArray]"
        }
        else {
            # Adicionar após a linha site_url
            $content = $content -replace '(site_url\s*=\s*"[^"]*")', "`$1`nadditional_redirect_urls = [$urlArray]"
        }
        
        # Salvar arquivo
        $content | Set-Content $ConfigFile -Encoding UTF8
        
        Write-ColorOutput "✅ Configurações de Auth atualizadas!" "Green"
        return $true
    }
    catch {
        Write-ColorOutput "❌ Erro ao atualizar config.toml: $($_.Exception.Message)" "Red"
        return $false
    }
}

function Show-CurrentConfig {
    if (Test-Path $ConfigPath) {
        $content = Get-Content $ConfigPath -Raw
        
        $siteUrlMatch = [regex]::Match($content, 'site_url\s*=\s*"([^"]*)"')
        $redirectUrlsMatch = [regex]::Match($content, 'additional_redirect_urls\s*=\s*\[([^\]]*)\]')
        
        Write-ColorOutput "`n📋 Configurações atuais:" "Cyan"
        Write-ColorOutput "Site URL: $($siteUrlMatch.Groups[1].Value)" "White"
        Write-ColorOutput "Redirect URLs: $($redirectUrlsMatch.Groups[1].Value)" "White"
    }
}

function Restart-SupabaseLocal {
    if ($SkipRestart) {
        Write-ColorOutput "⏭️ Reinicialização ignorada (--SkipRestart)" "Yellow"
        return $true
    }
    
    try {
        Write-ColorOutput "🔄 Reiniciando Supabase local..." "Yellow"
        
        # Parar Supabase
        Write-ColorOutput "⏹️ Parando Supabase..." "Yellow"
        & npx supabase stop 2>$null
        Start-Sleep -Seconds 3
        
        # Iniciar Supabase
        Write-ColorOutput "▶️ Iniciando Supabase..." "Yellow"
        & npx supabase start
        
        # Verificar se está rodando
        $attempts = 0
        do {
            Start-Sleep -Seconds 2
            $attempts++
            $isRunning = Test-SupabaseRunning
        } while (-not $isRunning -and $attempts -lt 30)
        
        if ($isRunning) {
            Write-ColorOutput "✅ Supabase local iniciado com sucesso!" "Green"
            return $true
        }
        else {
            Write-ColorOutput "⚠️ Supabase pode não ter iniciado corretamente" "Yellow"
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ Erro ao reiniciar Supabase: $($_.Exception.Message)" "Red"
        return $false
    }
}

# EXECUÇÃO PRINCIPAL
Write-ColorOutput "🚀 Sincronização de URLs de Auth - Supabase Local" "Cyan"
Write-ColorOutput "=================================================" "Cyan"

# Verificar se está no diretório correto
if (-not (Test-Path $ConfigPath)) {
    Write-ColorOutput "❌ Arquivo config.toml não encontrado!" "Red"
    Write-ColorOutput "💡 Execute este script na raiz do projeto (onde está a pasta supabase/)" "Yellow"
    exit 1
}

# Mostrar configurações atuais
Show-CurrentConfig

# Mostrar o que será configurado
Write-ColorOutput "`n📝 Configurações que serão aplicadas:" "Cyan"
Write-ColorOutput "Site URL: $SiteUrl" "White"
Write-ColorOutput "Redirect URLs:" "White"
$LocalUrls | ForEach-Object { Write-ColorOutput "  - $_" "Gray" }

# Confirmar com o usuário
if (-not $Force) {
    $answer = Read-Host "`n❓ Continuar com a sincronização? (y/n)"
    if ($answer -notin @('y', 'yes', 'Y', 'YES')) {
        Write-ColorOutput "❌ Operação cancelada pelo usuário." "Red"
        exit 0
    }
}

# Criar backup
Write-ColorOutput "`n📋 Criando backup da configuração atual..." "Yellow"
$backupCreated = Backup-Config

# Atualizar configurações
Write-ColorOutput "🔧 Atualizando configurações de Auth..." "Yellow"
$configUpdated = Update-AuthConfig -ConfigFile $ConfigPath -SiteUrl $SiteUrl -RedirectUrls $LocalUrls

if ($configUpdated) {
    # Reiniciar Supabase local
    $restarted = Restart-SupabaseLocal
    
    if ($restarted) {
        Write-ColorOutput "`n✅ Sincronização concluída com sucesso!" "Green"
        Write-ColorOutput "🌐 URLs locais configuradas:" "Cyan"
        $LocalUrls | ForEach-Object { Write-ColorOutput "   - $_" "Gray" }
        Write-ColorOutput "`n🔗 Acesse: http://localhost:54321" "Cyan"
    }
    else {
        Write-ColorOutput "`n⚠️ Configurações atualizadas, mas houve problema no restart." "Yellow"
        Write-ColorOutput "💡 Execute manualmente: npx supabase stop && npx supabase start" "Yellow"
    }
}
else {
    Write-ColorOutput "`n❌ Falha na atualização das configurações." "Red"
    
    # Restaurar backup se disponível
    if ($backupCreated -and (Test-Path $BackupPath)) {
        Copy-Item $BackupPath $ConfigPath -Force
        Write-ColorOutput "🔄 Backup restaurado." "Yellow"
    }
}

Write-ColorOutput "`n📋 Para verificar as configurações atuais, execute:" "Cyan"
Write-ColorOutput "   .\scripts\url-configuration\check-auth-config.ps1" "Gray"
