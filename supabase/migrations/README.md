# Supabase Migrations - Estrutura Modular

Esta pasta contém todas as migrations do Supabase organizadas de forma modular seguindo o princípio de responsabilidade única.

## Estrutura de Pastas

### 📁 `/core`
Migrations fundamentais do sistema, como configurações básicas, extensões e estruturas principais.

### 📁 `/auth`
Migrations relacionadas a autenticação, autorização e gestão de usuários.

### 📁 `/ecommerce`
Migrations relacionadas ao sistema de e-commerce:
- **`/cart`** - Carrinho de compras
- **`/orders`** - Pedidos e gestão de vendas
- **`/coupons`** - Sistema de cupons e promoções
- **`/payments`** - Integrações de pagamento (PagarMe, etc.)

### 📁 `/sites`
Migrations relacionadas à gestão de sites:
- **`/best_selling`** - Sites mais vendidos
- **`/favorites`** - Sites favoritos dos usuários
- **`/promotion_sites`** - Sites em promoção

### 📁 `/legal`
Migrations relacionadas a documentos legais:
- **`/contracts`** - Contratos, termos de uso, políticas de privacidade

### 📁 `/storage`
Migrations relacionadas ao armazenamento de arquivos, buckets e políticas de storage.

### 📁 `/debug`
Migrations de desenvolvimento, debug e ferramentas de monitoramento.

## Convenções de Nomenclatura

### Formato de Arquivo
```
YYYYMMDDHHMMSS_descricao_da_migration.sql
```

### Exemplos
- `20250805120000_create_best_selling_sites_table.sql`
- `20250805120001_add_best_selling_sites_rls_policies.sql`
- `20250805120002_create_best_selling_sites_functions.sql`

## Regras de Organização

1. **Responsabilidade Única**: Cada migration deve ter uma única responsabilidade
2. **Modularidade**: Separar por funcionalidades em pastas específicas
3. **Ordem Cronológica**: Manter a ordem temporal das migrations
4. **Documentação**: Cada pasta deve ter comentários explicativos nas migrations

## Como Usar

1. Identifique a funcionalidade da sua migration
2. Coloque na pasta apropriada
3. Use a nomenclatura padrão com timestamp
4. Documente as mudanças no código SQL

## Migrations Legadas

As migrations antigas na raiz da pasta serão gradualmente movidas para as respectivas pastas modulares conforme necessário.
