# Migration: Add Outline Column to Order Items

## Objetivo
Adicionar uma coluna `outline` à tabela `order_items` para armazenar dados JSON das pautas enviadas pelos usuários para criação de artigos.

## Detalhes da Migration

### Arquivo Principal
- **Nome**: `20250807150000_add_outline_column_to_order_items.sql`
- **Localização**: `supabase/migrations/ecommerce/orders/`

### Mudanças Implementadas

1. **Nova Coluna**: `outline JSONB`
   - Tipo: JSONB (para melhor performance e validação)
   - Nullable: Sim (nem todos os itens terão pauta)
   - Propósito: Armazenar dados da pauta do artigo

2. **Estrutura JSON Esperada**:
   ```json
   {
     "palavra_chave": "string",
     "url_site": "string", 
     "texto_ancora": "string",
     "requisitos_especiais": "string",
     "created_at": "timestamp",
     "updated_at": "timestamp"
   }
   ```

3. **Índices Criados**:
   - `idx_order_items_outline`: Índice GIN para consultas eficientes no JSON
   - `idx_order_items_has_outline`: Índice para verificar existência de outline

### Rollback
- **Arquivo**: `20250807150000_add_outline_column_to_order_items_down.sql`
- **Funcionalidade**: Remove a coluna e índices relacionados

## Benefícios

1. **Performance**: JSONB oferece indexação e consultas otimizadas
2. **Flexibilidade**: Estrutura JSON permite expansão futura sem alterações de schema
3. **Integração**: Dados ficam diretamente na tabela order_items, eliminando JOINs
4. **Consistência**: Mantém dados da pauta junto com o item do pedido

## Uso na Aplicação

```typescript
// Interface atualizada
interface OrderItem {
  // ... outras propriedades
  outline?: {
    palavra_chave: string;
    url_site: string;
    texto_ancora: string;
    requisitos_especiais: string;
    created_at?: string;
    updated_at?: string;
  };
}

// Consulta com outline
const { data } = await supabase
  .from('order_items')
  .select('*, outline')
  .eq('order_id', orderId);

// Atualizar outline
await supabase
  .from('order_items')
  .update({ 
    outline: {
      palavra_chave: 'SEO',
      url_site: 'https://example.com',
      texto_ancora: 'melhor SEO',
      requisitos_especiais: 'Focar em performance'
    }
  })
  .eq('id', itemId);
```

## Relacionamento com Tabela Pautas
Esta migration oferece uma alternativa à tabela `pautas` separada, mantendo os dados diretamente no `order_items` para melhor performance e simplicidade.
