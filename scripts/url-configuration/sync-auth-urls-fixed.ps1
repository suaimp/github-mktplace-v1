# Sync Auth URLs - Supabase Local Configuration
# Script para sincronizar URLs de autenticacao do Supabase para ambiente local

param(
    [switch]$Force = $false,
    [switch]$SkipRestart = $false,
    [string]$SiteUrl = "http://localhost:3000"
)

# Configuracoes
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
        Write-ColorOutput "Backup criado: $BackupPath" "Yellow"
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
        Write-ColorOutput "Erro: Arquivo config.toml nao encontrado: $ConfigFile" "Red"
        return $false
    }
    
    try {
        $content = Get-Content $ConfigFile -Raw
        
        # Atualizar site_url
        $pattern1 = 'site_url\s*=\s*"[^"]*"'
        $replacement1 = "site_url = `"$SiteUrl`""
        $content = $content -replace $pattern1, $replacement1
        
        # Preparar array de URLs para config.toml
        $urlArray = ($RedirectUrls | ForEach-Object { "`"$_`"" }) -join ", "
        
        # Atualizar ou adicionar additional_redirect_urls
        $pattern2 = 'additional_redirect_urls\s*=\s*\[[^\]]*\]'
        $replacement2 = "additional_redirect_urls = [$urlArray]"
        
        if ($content -match $pattern2) {
            $content = $content -replace $pattern2, $replacement2
        }
        else {
            # Adicionar apos a linha site_url
            $pattern3 = '(site_url\s*=\s*"[^"]*")'
            $replacement3 = "`$1`nadditional_redirect_urls = [$urlArray]"
            $content = $content -replace $pattern3, $replacement3
        }
        
        # Salvar arquivo
        $content | Set-Content $ConfigFile -Encoding UTF8
        
        Write-ColorOutput "Configuracoes de Auth atualizadas!" "Green"
        return $true
    }
    catch {
        Write-ColorOutput "Erro ao atualizar config.toml: $($_.Exception.Message)" "Red"
        return $false
    }
}

function Show-CurrentConfig {
    if (Test-Path $ConfigPath) {
        $content = Get-Content $ConfigPath -Raw
        
        $siteUrlPattern = 'site_url\s*=\s*"([^"]*)"'
        $redirectUrlsPattern = 'additional_redirect_urls\s*=\s*\[([^\]]*)\]'
        
        if ($content -match $siteUrlPattern) {
            $currentSiteUrl = $Matches[1]
        } else {
            $currentSiteUrl = "Nao configurado"
        }
        
        if ($content -match $redirectUrlsPattern) {
            $currentRedirectUrls = $Matches[1]
        } else {
            $currentRedirectUrls = "Nao configurado"
        }
        
        Write-ColorOutput "`nConfiguracoes atuais:" "Cyan"
        Write-ColorOutput "Site URL: $currentSiteUrl" "White"
        Write-ColorOutput "Redirect URLs: $currentRedirectUrls" "White"
    }
}

function Restart-SupabaseLocal {
    if ($SkipRestart) {
        Write-ColorOutput "Reinicializacao ignorada (SkipRestart)" "Yellow"
        return $true
    }
    
    try {
        Write-ColorOutput "Reiniciando Supabase local..." "Yellow"
        
        # Parar Supabase
        Write-ColorOutput "Parando Supabase..." "Yellow"
        & npx supabase stop 2>$null
        Start-Sleep -Seconds 3
        
        # Iniciar Supabase
        Write-ColorOutput "Iniciando Supabase..." "Yellow"
        & npx supabase start
        
        # Verificar se esta rodando
        $attempts = 0
        do {
            Start-Sleep -Seconds 2
            $attempts++
            $isRunning = Test-SupabaseRunning
        } while (-not $isRunning -and $attempts -lt 30)
        
        if ($isRunning) {
            Write-ColorOutput "Supabase local iniciado com sucesso!" "Green"
            return $true
        }
        else {
            Write-ColorOutput "Supabase pode nao ter iniciado corretamente" "Yellow"
            return $false
        }
    }
    catch {
        Write-ColorOutput "Erro ao reiniciar Supabase: $($_.Exception.Message)" "Red"
        return $false
    }
}

# EXECUCAO PRINCIPAL
Write-ColorOutput "Sincronizacao de URLs de Auth - Supabase Local" "Cyan"
Write-ColorOutput "=============================================" "Cyan"

# Verificar se esta no diretorio correto
if (-not (Test-Path $ConfigPath)) {
    Write-ColorOutput "Erro: Arquivo config.toml nao encontrado!" "Red"
    Write-ColorOutput "Execute este script na raiz do projeto (onde esta a pasta supabase/)" "Yellow"
    exit 1
}

# Mostrar configuracoes atuais
Show-CurrentConfig

# Mostrar o que sera configurado
Write-ColorOutput "`nConfiguracoes que serao aplicadas:" "Cyan"
Write-ColorOutput "Site URL: $SiteUrl" "White"
Write-ColorOutput "Redirect URLs:" "White"
$LocalUrls | ForEach-Object { Write-ColorOutput "  - $_" "Gray" }

# Confirmar com o usuario
if (-not $Force) {
    $answer = Read-Host "`nContinuar com a sincronizacao? (y/n)"
    if ($answer -notin @('y', 'yes', 'Y', 'YES')) {
        Write-ColorOutput "Operacao cancelada pelo usuario." "Red"
        exit 0
    }
}

# Criar backup
Write-ColorOutput "`nCriando backup da configuracao atual..." "Yellow"
$backupCreated = Backup-Config

# Atualizar configuracoes
Write-ColorOutput "Atualizando configuracoes de Auth..." "Yellow"
$configUpdated = Update-AuthConfig -ConfigFile $ConfigPath -SiteUrl $SiteUrl -RedirectUrls $LocalUrls

if ($configUpdated) {
    # Reiniciar Supabase local
    $restarted = Restart-SupabaseLocal
    
    if ($restarted) {
        Write-ColorOutput "`nSincronizacao concluida com sucesso!" "Green"
        Write-ColorOutput "URLs locais configuradas:" "Cyan"
        $LocalUrls | ForEach-Object { Write-ColorOutput "   - $_" "Gray" }
        Write-ColorOutput "`nAcesse: http://localhost:54321" "Cyan"
    }
    else {
        Write-ColorOutput "`nConfiguracoes atualizadas, mas houve problema no restart." "Yellow"
        Write-ColorOutput "Execute manualmente: npx supabase stop && npx supabase start" "Yellow"
    }
}
else {
    Write-ColorOutput "`nFalha na atualizacao das configuracoes." "Red"
    
    # Restaurar backup se disponivel
    if ($backupCreated -and (Test-Path $BackupPath)) {
        Copy-Item $BackupPath $ConfigPath -Force
        Write-ColorOutput "Backup restaurado." "Yellow"
    }
}

Write-ColorOutput "`nPara verificar as configuracoes atuais, execute:" "Cyan"
Write-ColorOutput "   .\scripts\url-configuration\check-auth-config.ps1" "Gray"
