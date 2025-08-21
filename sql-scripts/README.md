# 📁 SQL Scripts - Estrutura Modular

Esta pasta contém scripts SQL organizados de forma modular para facilitar manutenção e execução.

## � EXECUÇÃO RÁPIDA

### Para aplicar as migrations imediatamente:
1. **Abra o Supabase Studio**: http://localhost:54323
2. **Vá para SQL Editor**
3. **Execute o arquivo**: `execute_migration_studio_clean.sql` (pasta raiz)
4. **Clique em RUN** ▶️

## �📋 Estrutura das Pastas

```
sql-scripts/
├── migrations/             # Migrations organizadas por data
│   ├── 20250821154721_create_notifications_table.sql
│   ├── 20250821160000_fix_notifications_rls_policy.sql
│   └── 20250821170000_restructure_notifications_table.sql
├── notifications/          # Scripts específicos da tabela notifications
│   ├── 01_alter_table_structure.sql
│   └── migration_notifications_restructure.sql
├── policies/               # Scripts de RLS policies
│   ├── 01_remove_old_policies.sql
│   └── 02_create_new_policies.sql
├── indexes/                # Scripts de criação de índices
│   └── notifications_indexes.sql
└── execute_all_notifications_changes.sql  # Script modular
```

## 🎯 Arquivos de Execução

### Na Pasta Raiz:
- **`execute_migration_studio_clean.sql`** ⭐ - **USE ESTE** - Script limpo e completo
- **`execute_migration_studio.sql`** - Versão anterior (ignore)
- **`execute_notifications_migration.sql`** - Versão com verificações extras

## � Como Executar

### Opção 1: Script Principal (Recomendado)
Execute o script principal que chama todos os outros em ordem:
```sql
\i sql-scripts/execute_all_notifications_changes.sql
```

### Opção 2: Execução Manual Passo a Passo
1. **Alterações estruturais**:
   ```sql
   \i sql-scripts/notifications/01_alter_table_structure.sql
   ```

2. **Índices de performance**:
   ```sql
   \i sql-scripts/indexes/notifications_indexes.sql
   ```

3. **Remoção de policies antigas**:
   ```sql
   \i sql-scripts/policies/01_remove_old_policies.sql
   ```

4. **Criação de novas policies**:
   ```sql
   \i sql-scripts/policies/02_create_new_policies.sql
   ```

## 🏗️ Alterações Implementadas

### Estrutura da Tabela `notifications`
- ✅ **Renomeado**: `user_id` → `sender_id`
- ✅ **Adicionado**: `customer_id` (UUID, referencia `auth.users`)
- ✅ **Comentários**: Documentação das colunas

### Índices de Performance
- `idx_notifications_sender_id`
- `idx_notifications_customer_id`
- `idx_notifications_type`
- `idx_notifications_created_at`
- `idx_notifications_customer_type_created` (composto)

### Políticas RLS
- **SELECT**: Usuários veem notificações onde são `customer_id` + Admins veem todas
- **INSERT**: Usuários autenticados podem criar
- **UPDATE/DELETE**: Usuários podem modificar suas notificações + Admins podem modificar todas

## 🎯 Lógica de Negócio

### Campos da Tabela
- **`sender_id`**: Quem enviou a mensagem/criou a notificação
- **`customer_id`**: Cliente do pedido (destinatário da notificação)
- **`type`**: Tipo da notificação ('chat', 'purchase', 'system')
- **`title`**: Título/URL do produto
- **`subtitle`**: ID do pedido
- **`content`**: Conteúdo da mensagem

### Fluxo de Notificações
1. **Cliente envia mensagem**:
   - `sender_id` = Cliente
   - `customer_id` = Cliente
   - **Destinatários**: Todos os admins

2. **Admin envia mensagem**:
   - `sender_id` = Admin
   - `customer_id` = Cliente do pedido
   - **Destinatários**: Apenas o cliente

## 🔧 Troubleshooting

### Se as alterações não foram aplicadas:
1. Verifique se você está conectado ao banco correto
2. Confirme que tem permissões de ALTER TABLE
3. Execute os scripts em ordem

### Para reverter alterações:
```sql
-- Reverter renomeação de coluna
ALTER TABLE notifications RENAME COLUMN sender_id TO user_id;

-- Remover coluna customer_id
ALTER TABLE notifications DROP COLUMN customer_id;
```

## 📝 Notas Importantes

- ⚠️ **Backup**: Sempre faça backup antes de executar alterações estruturais
- 🔄 **Ordem**: Execute os scripts na ordem correta
- 🧪 **Teste**: Teste em ambiente local antes de aplicar em produção
- 📊 **Monitoramento**: Monitore performance após criação de índices
