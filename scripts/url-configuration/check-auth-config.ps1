# Check Auth Configuration - Supabase Local
# Script para verificar configurações atuais de Auth do Supabase local
# Autor: Sistema de Marketplace

param(
    [switch]$Detailed = $false,
    [switch]$Json = $false
)

$ConfigPath = "supabase\config.toml"

function Write-ColorOutput {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    if (-not $Json) {
        Write-Host $Text -ForegroundColor $Color
    }
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

function Get-AuthConfig {
    if (-not (Test-Path $ConfigPath)) {
        return @{
            error = "Arquivo config.toml não encontrado"
            found = $false
        }
    }
    
    try {
        $content = Get-Content $ConfigPath -Raw
        
        # Extrair configurações
        $siteUrlMatch = [regex]::Match($content, 'site_url\s*=\s*"([^"]*)"')
        $redirectUrlsMatch = [regex]::Match($content, 'additional_redirect_urls\s*=\s*\[([^\]]*)\]')
        $jwtExpiryMatch = [regex]::Match($content, 'jwt_expiry\s*=\s*(\d+)')
        $enableSignupMatch = [regex]::Match($content, 'enable_signup\s*=\s*(true|false)')
        
        # Processar redirect URLs
        $redirectUrls = @()
        if ($redirectUrlsMatch.Success) {
            $urlsString = $redirectUrlsMatch.Groups[1].Value
            $redirectUrls = ($urlsString -split ',' | ForEach-Object { 
                $_.Trim() -replace '"', '' 
            }) | Where-Object { $_.Length -gt 0 }
        }
        
        return @{
            found = $true
            siteUrl = if ($siteUrlMatch.Success) { $siteUrlMatch.Groups[1].Value } else { "Não configurado" }
            redirectUrls = $redirectUrls
            jwtExpiry = if ($jwtExpiryMatch.Success) { $jwtExpiryMatch.Groups[1].Value } else { "Não configurado" }
            enableSignup = if ($enableSignupMatch.Success) { $enableSignupMatch.Groups[1].Value } else { "Não configurado" }
            supabaseRunning = Test-SupabaseRunning
        }
    }
    catch {
        return @{
            error = "Erro ao ler config.toml: $($_.Exception.Message)"
            found = $false
        }
    }
}

function Show-AuthConfig {
    param($config)
    
    if (-not $config.found) {
        Write-ColorOutput "❌ $($config.error)" "Red"
        return
    }
    
    Write-ColorOutput "🔍 Configurações de Auth - Supabase Local" "Cyan"
    Write-ColorOutput "=========================================" "Cyan"
    
    # Status do Supabase
    $statusColor = if ($config.supabaseRunning) { "Green" } else { "Red" }
    $statusText = if ($config.supabaseRunning) { "✅ Rodando" } else { "❌ Parado" }
    Write-ColorOutput "Status: $statusText" $statusColor
    
    if ($config.supabaseRunning) {
        Write-ColorOutput "URL Local: http://localhost:54321" "Cyan"
    }
    
    Write-ColorOutput ""
    
    # Configurações básicas
    Write-ColorOutput "📍 Site URL: $($config.siteUrl)" "White"
    Write-ColorOutput "⏱️ JWT Expiry: $($config.jwtExpiry) segundos" "White"
    Write-ColorOutput "👤 Enable Signup: $($config.enableSignup)" "White"
    
    Write-ColorOutput ""
    
    # Redirect URLs
    Write-ColorOutput "🔗 Redirect URLs ($($config.redirectUrls.Count)):" "Yellow"
    if ($config.redirectUrls.Count -eq 0) {
        Write-ColorOutput "   Nenhuma URL configurada" "Red"
    } else {
        $config.redirectUrls | ForEach-Object {
            $color = if ($_ -like "*localhost*") { "Green" } else { "Gray" }
            Write-ColorOutput "   - $_" $color
        }
    }
    
    if ($Detailed) {
        Write-ColorOutput ""
        Write-ColorOutput "📋 Análise Detalhada:" "Cyan"
        
        # Verificar URLs localhost
        $localhostUrls = $config.redirectUrls | Where-Object { $_ -like "*localhost*" }
        $prodUrls = $config.redirectUrls | Where-Object { $_ -notlike "*localhost*" }
        
        Write-ColorOutput "   🏠 URLs Localhost: $($localhostUrls.Count)" "Green"
        Write-ColorOutput "   🌐 URLs Produção: $($prodUrls.Count)" "Blue"
        
        # Verificar portas comuns
        $commonPorts = @("3000", "5173", "5174")
        $coveredPorts = @()
        foreach ($port in $commonPorts) {
            if ($config.redirectUrls | Where-Object { $_ -like "*:$port*" }) {
                $coveredPorts += $port
            }
        }
        
        Write-ColorOutput "   🔌 Portas cobertas: $($coveredPorts -join ', ')" "Yellow"
        
        # Verificar rotas de reset
        $resetRoutes = $config.redirectUrls | Where-Object { $_ -like "*reset*" -or $_ -like "*password*" }
        Write-ColorOutput "   🔐 Rotas de Reset: $($resetRoutes.Count)" "Magenta"
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "💡 Comandos úteis:" "Cyan"
    Write-ColorOutput "   Sincronizar URLs: .\scripts\url-configuration\sync-auth-urls.ps1" "Gray"
    Write-ColorOutput "   Restart Supabase: npx supabase stop && npx supabase start" "Gray"
}

function Export-JsonConfig {
    param($config)
    
    $config | ConvertTo-Json -Depth 3 | Write-Output
}

# EXECUÇÃO PRINCIPAL
$authConfig = Get-AuthConfig

if ($Json) {
    Export-JsonConfig $authConfig
} else {
    Show-AuthConfig $authConfig
    
    if (-not $authConfig.supabaseRunning) {
        Write-ColorOutput "`n⚠️ Supabase local não está rodando!" "Yellow"
        Write-ColorOutput "💡 Execute: npx supabase start" "Gray"
    }
}
