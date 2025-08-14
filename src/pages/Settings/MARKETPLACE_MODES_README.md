# Sistema de Modos do Marketplace

Este documento explica o novo fluxo de configurações de modo do marketplace implementado na rota `/settings`.

## 📋 Visão Geral

O sistema permite configurar dois modos operacionais do marketplace:
- **Modo de Teste**: Para testes e desenvolvimento
- **Modo de Manutenção**: Para bloqueio completo do acesso

## 🗂️ Estrutura de Arquivos

### Serviços (Database Layer)
```
src/services/db-services/settings-services/
└── marketplaceModeService.ts     # CRUD para configurações de modo
```

### Hooks (Business Logic)
```
src/pages/Settings/hooks/
└── useMarketplaceMode.ts         # Gerenciamento de estado dos modos
```

### Componentes (UI Layer)
```
src/pages/Settings/components/
├── MarketplaceModeSettings.tsx           # Componente principal
└── MarketplaceModeMessageField.tsx       # Campo de mensagem reutilizável
```

## 🗄️ Estrutura do Banco de Dados

### Novas Colunas na Tabela `settings`

```sql
-- Flags de modo
marketplace_in_test            BOOLEAN DEFAULT false
marketplace_in_maintenance     BOOLEAN DEFAULT false

-- Mensagens personalizadas
marketplace_test_message       TEXT
marketplace_maintenance_message TEXT
```

### SQL de Criação das Colunas

```sql
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS marketplace_in_test boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketplace_in_maintenance boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketplace_test_message text DEFAULT 'O marketplace está em modo de teste. Algumas funcionalidades podem não estar disponíveis.',
ADD COLUMN IF NOT EXISTS marketplace_maintenance_message text DEFAULT 'O marketplace está temporariamente em manutenção. Tente novamente em alguns minutos.';
```

## 🔄 Fluxo de Funcionamento

### 1. Interface do Usuário
- **Localização**: `/settings` → aba "Marketplace"
- **Componentes**: 2 toggles (Modo de Teste e Modo de Manutenção)
- **Campos dinâmicos**: Aparecem quando o toggle é ativado

### 2. Interação do Usuário
1. Admin acessa a rota `/settings`
2. Navega para a aba "Marketplace" (antigo "Logo")
3. Ativa/desativa os toggles conforme necessário
4. Quando ativado, aparece campo para personalizar mensagem
5. Mensagem é salva automaticamente ou com Ctrl+Enter

### 3. Persistência de Dados
```typescript
// Hook gerencia o estado
const { toggleTestMode, updateTestMessage } = useMarketplaceMode();

// Serviço comunica com o banco
MarketplaceModeService.toggleTestMode(enabled, message);
```

## 📡 API do Serviço

### `MarketplaceModeService`

#### Métodos Principais
```typescript
// Buscar configurações atuais
getMarketplaceModeSettings(): Promise<MarketplaceModeSettings | null>

// Atualizar configurações
updateMarketplaceModeSettings(data: MarketplaceModeData): Promise<boolean>

// Alternar modo de teste
toggleTestMode(enabled: boolean, message?: string): Promise<boolean>

// Alternar modo de manutenção
toggleMaintenanceMode(enabled: boolean, message?: string): Promise<boolean>

// Atualizar apenas mensagens
updateTestMessage(message: string): Promise<boolean>
updateMaintenanceMessage(message: string): Promise<boolean>
```

#### Interfaces
```typescript
interface MarketplaceModeSettings {
  id: string;
  marketplace_in_test: boolean;
  marketplace_in_maintenance: boolean;
  marketplace_test_message: string | null;
  marketplace_maintenance_message: string | null;
  updated_at?: string;
}
```

## 🎯 Hook `useMarketplaceMode`

### Retorno do Hook
```typescript
interface UseMarketplaceModeReturn {
  settings: MarketplaceModeSettings | null;
  loading: boolean;
  isTestMode: boolean;
  isMaintenanceMode: boolean;
  testMessage: string;
  maintenanceMessage: string;
  toggleTestMode: (enabled: boolean) => Promise<void>;
  toggleMaintenanceMode: (enabled: boolean) => Promise<void>;
  updateTestMessage: (message: string) => Promise<void>;
  updateMaintenanceMessage: (message: string) => Promise<void>;
  loadSettings: () => Promise<void>;
}
```

### Funcionalidades
- ✅ Carregamento automático das configurações
- ✅ Estados sincronizados com o banco
- ✅ Feedback de loading e erros
- ✅ Toasts de sucesso/erro automáticos

## 🎨 Componentes UI

### `MarketplaceModeSettings`
- **Responsabilidade**: Orquestrar os toggles e campos de mensagem
- **Funcionalidades**:
  - Renderiza os 2 toggles
  - Mostra/esconde campos de mensagem dinamicamente
  - Gerencia estados de loading

### `MarketplaceModeMessageField`
- **Responsabilidade**: Campo de texto com salvamento inteligente
- **Funcionalidades**:
  - Indicador visual de mudanças não salvas
  - Salvamento com Ctrl+Enter
  - Botão "Salvar" quando há mudanças
  - Estados de loading e desabilitado

## 🚀 Como Usar

### Para Desenvolvedores

1. **Instalar/Executar as migrações SQL**
2. **Acessar a interface**: `/settings` → aba "Marketplace"
3. **Testar os toggles**: Ativar/desativar e verificar persistência
4. **Personalizar mensagens**: Quando ativo, alterar as mensagens

### Para Integração com Frontend

```typescript
// Verificar se marketplace está em modo de teste
const { isTestMode, testMessage } = useMarketplaceMode();

if (isTestMode) {
  // Mostrar banner ou modal com testMessage
  showTestModeBanner(testMessage);
}
```

### Para Integração com Backend/Middleware

```sql
-- Verificar modo atual do marketplace
SELECT 
  marketplace_in_test,
  marketplace_in_maintenance,
  marketplace_test_message,
  marketplace_maintenance_message
FROM settings 
LIMIT 1;
```

## 🏗️ Arquitetura e Princípios

### SOLID Principles
- ✅ **Single Responsibility**: Cada arquivo tem uma função específica
- ✅ **Open/Closed**: Extensível sem modificar código existente
- ✅ **Dependency Inversion**: UI depende de abstrações (hooks)

### Separation of Concerns
- 🗄️ **Database Layer**: `marketplaceModeService.ts`
- 🧠 **Business Logic**: `useMarketplaceMode.ts`
- 🎨 **Presentation Layer**: Componentes React

### Modularidade
- 📁 Arquivos organizados por responsabilidade
- 🔄 Componentes reutilizáveis
- 📦 Hooks customizados encapsulam lógica complexa

## 🔧 Manutenção e Extensão

### Para Adicionar Novos Modos
1. Adicionar colunas no banco de dados
2. Estender interfaces no `marketplaceModeService.ts`
3. Adicionar métodos no serviço
4. Estender o hook `useMarketplaceMode`
5. Adicionar toggle no componente UI

### Para Modificar Mensagens Padrão
Alterar os valores `DEFAULT` na migração SQL ou no serviço.

## 📝 Notas Importantes

- ⚠️ **Modo de Manutenção**: Deve bloquear completamente o acesso ao marketplace
- 🧪 **Modo de Teste**: Permite acesso limitado/controlado
- 💾 **Persistência**: Todas as mudanças são salvas automaticamente
- 🔄 **Sincronização**: Estados são mantidos sincronizados entre UI e banco
- 🚨 **Feedback**: Usuário sempre recebe feedback das ações (toasts)

---

**Última atualização**: Agosto 2025  
**Versão**: 1.0.0  
**Autor**: Sistema de Configurações Marketplace
