# TablePagination - Componente de Paginação Reutilizável

## Descrição

O `TablePagination` é um componente reutilizável criado para padronizar a experiência de paginação em todas as tabelas da aplicação. Ele oferece um design consistente e funcionalidades completas de navegação entre páginas.

## Localização

```
src/components/common/pagination/
├── TablePagination.tsx         # Componente principal
├── types/
│   └── index.ts               # Interfaces e tipos
└── index.ts                   # Exportações
```

## Funcionalidades

- ✅ **Navegação entre páginas**: Botões Anterior/Próxima
- ✅ **Números de página**: Máximo de 5 páginas visíveis com janela inteligente
- ✅ **Informações de paginação**: Mostra range de itens e total
- ✅ **Design responsivo**: Adaptado para temas claro e escuro
- ✅ **Customizável**: Label dos itens personalizável
- ✅ **Acessibilidade**: Estados disabled apropriados

## Uso

### Importação

```tsx
import { TablePagination } from "../../components/common/pagination";
```

### Exemplo Básico

```tsx
<TablePagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
  showInfo={true}
  itemLabel="registros"
/>
```

### Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|---------|-----------|
| `currentPage` | `number` | ✅ | - | Página atual (1-indexed) |
| `totalPages` | `number` | ✅ | - | Total de páginas |
| `totalItems` | `number` | ✅ | - | Total de itens |
| `itemsPerPage` | `number` | ✅ | - | Itens por página |
| `onPageChange` | `(page: number) => void` | ✅ | - | Callback para mudança de página |
| `showInfo` | `boolean` | ❌ | `true` | Mostrar informações de range |
| `itemLabel` | `string` | ❌ | `"registros"` | Label customizado para os itens |

## Implementações Atuais

### 1. EntriesTable (Editorial Manager)
- **Localização**: `src/components/EditorialManager/EntriesTable.tsx`
- **Label**: "registros"
- **Contexto**: Paginação de entradas de formulários

### 2. OrderList (Orders)
- **Localização**: `src/pages/Orders/OrderList.tsx`
- **Label**: "pedidos"
- **Contexto**: Paginação de pedidos

## Design Pattern

O componente segue os seguintes princípios:

### Responsabilidade Única
- Focado apenas na funcionalidade de paginação
- Não gerencia estado de dados, apenas navegação

### Composição
- Separado em responsabilidades lógicas
- Reutilizável em diferentes contextos

### Consistência Visual
- Segue o design system da aplicação
- Suporte completo para dark/light theme

## Comportamentos

### Janela de Páginas
- Mostra até 5 números de página
- Centraliza a página atual quando possível
- Ajusta automaticamente próximo aos extremos

### Estados dos Botões
- **Anterior**: Disabled na primeira página
- **Próxima**: Disabled na última página
- **Números**: Destaque visual na página atual

### Auto-ocultação
- Component não renderiza se `totalPages <= 1`
- Evita UI desnecessária em listas pequenas

## Estilização

### Classes Base
```css
/* Container principal */
.border-t.border-gray-200.dark:border-gray-800

/* Botões de navegação */
.bg-white.border.border-gray-300.dark:bg-gray-800.dark:border-gray-700

/* Página ativa */
.bg-brand-500.text-white.border-brand-500
```

### Responsividade
- Padding responsivo: `px-4 sm:px-6`
- Layout flexível para diferentes tamanhos de tela

## Extensibilidade

### Futuros Melhoramentos
- [ ] Opção de jumper (ir para página específica)
- [ ] Seletor de itens por página
- [ ] Animações de transição
- [ ] Atalhos de teclado

### Personalização
Para customizar o visual, edite:
- `src/components/common/pagination/TablePagination.tsx`
- Mantenha consistência com o design system

## Exemplos de Uso

### Com informações completas
```tsx
<TablePagination
  currentPage={5}
  totalPages={10}
  totalItems={247}
  itemsPerPage={25}
  onPageChange={(page) => setCurrentPage(page)}
  showInfo={true}
  itemLabel="usuários"
/>
```

### Somente navegação
```tsx
<TablePagination
  currentPage={2}
  totalPages={8}
  totalItems={150}
  itemsPerPage={20}
  onPageChange={handlePageChange}
  showInfo={false}
/>
```

## Compatibilidade

- ✅ React 18+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Dark/Light themes
- ✅ Mobile responsive
