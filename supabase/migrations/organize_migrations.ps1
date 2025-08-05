# Script para organizar migrations automaticamente
$migrationsPath = "c:\Users\Moise\OneDrive\Área de Trabalho\Eu\github-mktplace-v1\supabase\migrations"

# Palavras-chave para categorização
$categories = @{
    "admin" = @("admin", "authentication", "auth")
    "forms" = @("form", "field", "input", "validation")
    "ui" = @("ui", "theme", "layout", "styling", "appearance")
    "marketplace" = @("product", "category", "listing", "inventory")
    "ecommerce/orders" = @("order", "purchase", "transaction")
    "ecommerce/cart" = @("cart", "shopping")
    "ecommerce/payments" = @("payment", "billing", "invoice")
    "auth" = @("user", "profile", "registration", "login")
    "core" = @("schema", "extension", "function", "trigger")
    "debug" = @("debug", "log", "monitoring", "test")
}

# Função para categorizar migration
function Get-MigrationCategory($content) {
    $content = $content.ToLower()
    
    foreach ($category in $categories.Keys) {
        foreach ($keyword in $categories[$category]) {
            if ($content -match $keyword) {
                return $category
            }
        }
    }
    return "core"  # default category
}

# Listar arquivos .sql na raiz
Get-ChildItem -Path $migrationsPath -Filter "*.sql" | ForEach-Object {
    if ($_.Name -notlike "*README*") {
        Write-Host "Analisando: $($_.Name)"
        
        # Ler primeiro parte do arquivo para análise
        $content = Get-Content $_.FullName -First 20 | Out-String
        $category = Get-MigrationCategory $content
        
        Write-Host "  Categoria sugerida: $category"
        Write-Host "  Conteúdo (primeiras linhas):"
        $content.Split("`n")[0..3] | ForEach-Object { Write-Host "    $_" }
        Write-Host ""
    }
}
