# Verification: Auth URL Configuration
# Script para verificar configurações de URLs de autenticação do Supabase
# Autor: Sistema de Marketplace

param(
    [switch]$Json = $false,
    [switch]$Detailed = $false,
    [switch]$TestUrls = $false
)

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

function Test-AuthEndpoint {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:54321/auth/v1/settings" -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Get-AuthConfigFromFile {
    $configPath = "supabase\config.toml"
    
    if (-not (Test-Path $configPath)) {
        return @{
            error = "Arquivo config.toml não encontrado"
            found = $false
        }
    }
    
    try {
        $content = Get-Content $configPath -Raw -Encoding UTF8
        
        # Extrair configurações usando regex
        $siteUrlPattern = 'site_url\s*=\s*["\''](.*?)["\'']\s*'
        $redirectUrlsPattern = 'additional_redirect_urls\s*=\s*\[(.*?)\]'
        $jwtExpiryPattern = 'jwt_expiry\s*=\s*(\d+)'
        $enableSignupPattern = 'enable_signup\s*=\s*(true|false)'
        $enabledPattern = '\[auth\][\s\S]*?enabled\s*=\s*(true|false)'
        
        $siteUrlMatch = [regex]::Match($content, $siteUrlPattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)
        $redirectUrlsMatch = [regex]::Match($content, $redirectUrlsPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $jwtExpiryMatch = [regex]::Match($content, $jwtExpiryPattern)
        $enableSignupMatch = [regex]::Match($content, $enableSignupPattern)
        $enabledMatch = [regex]::Match($content, $enabledPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
        
        # Processar redirect URLs
        $redirectUrls = @()
        if ($redirectUrlsMatch.Success) {
            $urlsString = $redirectUrlsMatch.Groups[1].Value
            # Remover quotes e espaços, dividir por vírgula
            $redirectUrls = ($urlsString -split ',' | ForEach-Object { 
                ($_.Trim() -replace '["\s]', '') 
            }) | Where-Object { $_.Length -gt 0 }
        }
        
        return @{
            found = $true
            enabled = if ($enabledMatch.Success) { $enabledMatch.Groups[1].Value -eq "true" } else { $true }
            siteUrl = if ($siteUrlMatch.Success) { $siteUrlMatch.Groups[1].Value } else { "Não configurado" }
            redirectUrls = $redirectUrls
            jwtExpiry = if ($jwtExpiryMatch.Success) { [int]$jwtExpiryMatch.Groups[1].Value } else { 3600 }
            enableSignup = if ($enableSignupMatch.Success) { $enableSignupMatch.Groups[1].Value -eq "true" } else { $true }
        }
    }
    catch {
        return @{
            error = "Erro ao ler config.toml: $($_.Exception.Message)"
            found = $false
        }
    }
}

function Show-AuthVerification {
    param($config)
    
    if (-not $config.found) {
        Write-ColorOutput "❌ $($config.error)" "Red"
        return
    }
    
    Write-ColorOutput "🔍 Verificação: Configurações de Auth" "Cyan"
    Write-ColorOutput "====================================" "Cyan"
    
    # Status do Supabase
    $supabaseRunning = Test-SupabaseRunning
    $authEndpoint = Test-AuthEndpoint
    
    $statusColor = if ($supabaseRunning) { "Green" } else { "Red" }
    $statusText = if ($supabaseRunning) { "✅ Online" } else { "❌ Offline" }
    Write-ColorOutput "Supabase Status: $statusText" $statusColor
    
    if ($supabaseRunning) {
        $authColor = if ($authEndpoint) { "Green" } else { "Yellow" }
        $authText = if ($authEndpoint) { "✅ Acessível" } else { "⚠️ Problema" }
        Write-ColorOutput "Auth Endpoint: $authText" $authColor
        Write-ColorOutput "Dashboard: http://localhost:54321" "Cyan"
    }
    
    Write-ColorOutput ""
    
    # Configurações de Auth
    $enabledColor = if ($config.enabled) { "Green" } else { "Red" }
    $enabledText = if ($config.enabled) { "✅ Habilitado" } else { "❌ Desabilitado" }
    Write-ColorOutput "Auth Module: $enabledText" $enabledColor
    
    Write-ColorOutput "📍 Site URL: $($config.siteUrl)" "White"
    Write-ColorOutput "⏱️ JWT Expiry: $($config.jwtExpiry) segundos" "White"
    
    $signupColor = if ($config.enableSignup) { "Green" } else { "Yellow" }
    $signupText = if ($config.enableSignup) { "✅ Habilitado" } else { "⚠️ Desabilitado" }
    Write-ColorOutput "👤 Enable Signup: $signupText" $signupColor
    
    Write-ColorOutput ""
    
    # Análise de Redirect URLs
    Write-ColorOutput "🔗 Redirect URLs Configuradas ($($config.redirectUrls.Count)):" "Yellow"
    
    if ($config.redirectUrls.Count -eq 0) {
        Write-ColorOutput "   ❌ Nenhuma URL configurada!" "Red"
        Write-ColorOutput "   💡 Execute: .\scripts\url-configuration\sync-auth-urls.ps1" "Yellow"
    } else {
        # Categorizar URLs
        $localhostUrls = @()
        $authRoutes = @()
        $externalUrls = @()
        
        foreach ($url in $config.redirectUrls) {
            if ($url -like "*localhost*") {
                $localhostUrls += $url
                if ($url -like "*password*" -or $url -like "*reset*") {
                    $authRoutes += $url
                }
            } else {
                $externalUrls += $url
            }
        }
        
        # Mostrar URLs
        foreach ($url in $config.redirectUrls) {
            $color = "Gray"
            $prefix = "   -"
            
            if ($url -like "*localhost*") {
                $color = "Green"
                $prefix = "   🏠"
            } elseif ($url -like "*password*" -or $url -like "*reset*") {
                $color = "Magenta"
                $prefix = "   🔐"
            } elseif ($url -notlike "*localhost*") {
                $color = "Blue"
                $prefix = "   🌐"
            }
            
            Write-ColorOutput "$prefix $url" $color
        }
        
        # Análise resumida
        Write-ColorOutput ""
        Write-ColorOutput "📊 Análise Resumida:" "Cyan"
        Write-ColorOutput "   🏠 URLs Localhost: $($localhostUrls.Count)" "Green"
        Write-ColorOutput "   🔐 Rotas de Auth: $($authRoutes.Count)" "Magenta"
        Write-ColorOutput "   🌐 URLs Externas: $($externalUrls.Count)" "Blue"
        
        # Verificar portas comuns
        $commonPorts = @("3000", "5173", "5174")
        $missingPorts = @()
        foreach ($port in $commonPorts) {
            if (-not ($localhostUrls | Where-Object { $_ -like "*:$port*" })) {
                $missingPorts += $port
            }
        }
        
        if ($missingPorts.Count -gt 0) {
            Write-ColorOutput "   ⚠️ Portas não cobertas: $($missingPorts -join ', ')" "Yellow"
        } else {
            Write-ColorOutput "   ✅ Todas as portas comuns cobertas" "Green"
        }
        
        # Verificar rotas essenciais
        $hasPasswordRecovery = $authRoutes | Where-Object { $_ -like "*password-recovery*" }
        $hasResetPassword = $authRoutes | Where-Object { $_ -like "*reset-password*" }
        
        if ($hasPasswordRecovery) {
            Write-ColorOutput "   ✅ Rota /password-recovery configurada" "Green"
        } else {
            Write-ColorOutput "   ⚠️ Rota /password-recovery não encontrada" "Yellow"
        }
        
        if ($hasResetPassword) {
            Write-ColorOutput "   ✅ Rota /reset-password configurada" "Green"
        } else {
            Write-ColorOutput "   ⚠️ Rota /reset-password não encontrada" "Yellow"
        }
    }
    
    # Recomendações
    Write-ColorOutput ""
    Write-ColorOutput "💡 Recomendações:" "Cyan"
    
    if (-not $supabaseRunning) {
        Write-ColorOutput "   ❗ Inicie o Supabase: npx supabase start" "Yellow"
    }
    
    if ($config.redirectUrls.Count -eq 0) {
        Write-ColorOutput "   ❗ Configure URLs: .\scripts\url-configuration\sync-auth-urls.ps1" "Yellow"
    }
    
    if (-not $config.enabled) {
        Write-ColorOutput "   ❗ Habilite Auth no config.toml: enabled = true" "Yellow"
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "🔧 Comandos úteis:" "Cyan"
    Write-ColorOutput "   Sincronizar: .\scripts\url-configuration\sync-auth-urls.ps1" "Gray"
    Write-ColorOutput "   Dashboard: http://localhost:54321" "Gray"
}

# EXECUÇÃO PRINCIPAL
$authConfig = Get-AuthConfigFromFile

if ($Json) {
    $result = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        supabaseRunning = Test-SupabaseRunning
        authEndpoint = Test-AuthEndpoint
        config = $authConfig
    }
    $result | ConvertTo-Json -Depth 4 | Write-Output
} else {
    Show-AuthVerification $authConfig
}
