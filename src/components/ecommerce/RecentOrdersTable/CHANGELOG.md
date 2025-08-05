# RecentOrdersTable - Refatoração para Exibir Dados da Tabela Orders

## Alterações Implementadas

### Funcionalidade Principal
- **Mudança de Fonte de Dados**: A tabela agora exibe dados da tabela `orders` em vez de `order_items`
- **Verificação de Admin Tripla**: Implementada verificação completa para administradores
- **Exibição de Campos**:
  - **ID**: Exibe `orders.id` (primeiros 6 caracteres)
  - **URL**: Busca as URLs dos `order_items` relacionados ao pedido
  - **Status**: Exibe `orders.status` com estilização colorida

### Verificação de Administrador
**Usa a MESMA estratégia do Dashboard:**
- Consulta a tabela `admins` com `eq("id", user.id)`
- Verifica se `role === "admin"`
- **Consistente com a rota `/dashboard`** que só é exibida para admins

### Regras de Exibição de URLs
- **1 URL**: Exibe favicon + URL
- **Múltiplas URLs**: Exibe favicons adicionais à esquerda (máx. 2) + favicon principal + primeira URL

### Estrutura de Arquivos (Princípio de Responsabilidade Única)

```
RecentOrdersTable/
├── db-service/
│   └── ordersTableService.ts          # Serviços de acesso ao banco de dados
├── services/
│   └── adminVerificationService.ts    # Verificação de status de administrador
├── interfaces/
│   └── OrderTableTypes.ts             # Tipos e interfaces
├── hooks/
│   └── useOrdersTableNew.ts           # Hook principal para gerenciar estado
├── components/
│   └── OrderTableRowNew.tsx           # Componente de linha da tabela
├── utils/
│   ├── urlUtils.ts                    # Utilitários para URLs e favicons
│   └── domain.ts                      # Utilitário para extrair domínios (existente)
└── RecentOrdersTable.tsx              # Componente principal
```

### Arquivos Criados/Modificados

#### 1. `services/adminVerificationService.ts` ⭐ **NOVO**
- Verifica as 3 condições para ser admin
- Retorna status detalhado de cada verificação
- Logs de debug para troubleshooting

#### 2. `db-service/ordersTableService.ts`
- Busca pedidos com URLs dos order_items relacionados
- Funções: `fetchOrdersWithUrls()`, `fetchRecentOrdersWithUrls()`

#### 3. `interfaces/OrderTableTypes.ts`
- Define tipos `OrderTableData` e `OrderTableRowProps`

#### 4. `hooks/useOrdersTableNew.ts`
- Hook para gerenciar estado da tabela
- Usa o serviço de verificação de admin
- Busca dados conforme modo (recentes vs todos)

#### 5. `components/OrderTableRowNew.tsx`
- Renderiza linha da tabela com novos dados
- Implementa lógica de favicons múltiplos
- Estilização de status com cores

#### 6. `utils/urlUtils.ts`
- `getFaviconUrl()`: Gera URL do favicon
- `getDomainFromUrl()`: Extrai domínio da URL

#### 7. `RecentOrdersTable.tsx` (modificado)
- Atualizado para usar novos hooks e componentes
- Mantém funcionalidades de paginação e filtros

### Características Técnicas
- **Modularidade**: Cada funcionalidade em arquivo separado
- **Responsabilidade Única**: Cada service tem uma função específica
- **TypeScript**: Tipagem completa em todos os arquivos
- **Performance**: Carregamento assíncrono com estados de loading
- **Responsividade**: Mantém design responsivo original
- **Acessibilidade**: Mantém atributos de acessibilidade

### Debug e Troubleshooting
O sistema inclui logs detalhados no console para debug:
- Status de verificação de admin (3 condições)
- Quantidade de pedidos buscados
- Modo de operação (admin vs usuário comum)
