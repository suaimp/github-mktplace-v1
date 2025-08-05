# Best Selling Sites - Triggers

Esta pasta contém todos os triggers relacionados à funcionalidade de "Best Selling Sites".

## Arquivos

### `20250805120001_create_best_selling_sites_auto_populate_trigger.sql`
**Função:** Trigger automático para popular a tabela `best_selling_sites`

**Funcionalidade:**
- Dispara automaticamente quando dados são inseridos na tabela `order_items`
- Verifica se já existe um registro com o mesmo `entry_id`
- **Se não existe:** Cria um novo registro
- **Se existe:** Atualiza o registro existente, somando a quantidade

**Campos mapeados:**
- `order_items.entry_id` → `best_selling_sites.entry_id`
- `order_items.product_name` → `best_selling_sites.product_name` 
- `order_items.product_url` → `best_selling_sites.product_url`
- `order_items.quantity` → `best_selling_sites.quantity` (somado se existir)

## Estrutura Modular

Esta pasta segue o princípio de responsabilidade única, mantendo todos os triggers relacionados a "Best Selling Sites" organizados em um local específico dentro da funcionalidade.

## Como Funciona

1. **Inserção em `order_items`** → Trigger dispara automaticamente
2. **Verificação de duplicatas** → Usa `ON CONFLICT` para eficiência
3. **UPSERT operation** → Insere novo ou atualiza existente
4. **Soma de quantidades** → Para ranking de produtos mais vendidos
