# Sistema de Mensagens de Status - Tela de Login

Este documento detalha o fluxo de exibição de mensagens de status do marketplace nas telas de login, com foco em informações cruciais para criação de testes automatizados.

## 📋 Visão Geral do Fluxo

### Cenários de Teste Principais

1. **Modo de Teste Ativo**: Banner amarelo no topo
2. **Modo de Manutenção Ativo**: Banner vermelho no topo  
3. **Ambos os Modos Ativos**: Dois banners (manutenção primeiro)
4. **Nenhum Modo Ativo**: Sem banners exibidos
5. **Erro de Conectividade**: Sem banners (falha silenciosa)

## 🎯 Casos de Teste Detalhados

### Teste 1: Modo de Teste Ativo
```typescript
// Dados de entrada no banco
marketplace_in_test = true
marketplace_test_message = "Sistema em teste - funcionalidades limitadas"

// Resultado esperado
- Banner amarelo visível
- Ícone de informação presente
- Mensagem personalizada exibida
- Banner posicionado acima do título "Login"
```

### Teste 2: Modo de Manutenção Ativo
```typescript
// Dados de entrada no banco
marketplace_in_maintenance = true
marketplace_maintenance_message = "Sistema em manutenção - tente novamente em 30 minutos"

// Resultado esperado
- Banner vermelho visível
- Ícone de alerta presente
- Mensagem personalizada exibida
- Banner posicionado acima do título "Login"
```

### Teste 3: Ambos os Modos Ativos
```typescript
// Dados de entrada no banco
marketplace_in_test = true
marketplace_in_maintenance = true
marketplace_test_message = "Teste ativo"
marketplace_maintenance_message = "Manutenção em progresso"

// Resultado esperado
- Dois banners visíveis
- Banner de manutenção (vermelho) aparece PRIMEIRO
- Banner de teste (amarelo) aparece SEGUNDO
- Ambos acima do título "Login"
```

### Teste 4: Nenhum Modo Ativo
```typescript
// Dados de entrada no banco
marketplace_in_test = false
marketplace_in_maintenance = false

// Resultado esperado
- Nenhum banner visível
- Título "Login" aparece imediatamente
- Layout normal da página
```

### Teste 5: Mensagens Vazias
```typescript
// Dados de entrada no banco
marketplace_in_test = true
marketplace_test_message = "" // string vazia

// Resultado esperado
- Banner NÃO deve aparecer
- Sistema deve tratar como modo inativo
```

## 🔍 Seletores para Testes E2E

### Identificadores CSS/Data-testid Sugeridos

```typescript
// Para implementar nos componentes
const TEST_IDS = {
  // Container principal
  MARKETPLACE_STATUS_CONTAINER: '[data-testid="marketplace-status-banner"]',
  
  // Banner de manutenção
  MAINTENANCE_BANNER: '[data-testid="maintenance-banner"]',
  MAINTENANCE_ICON: '[data-testid="maintenance-icon"]',
  MAINTENANCE_MESSAGE: '[data-testid="maintenance-message"]',
  
  // Banner de teste
  TEST_BANNER: '[data-testid="test-banner"]',
  TEST_ICON: '[data-testid="test-icon"]',
  TEST_MESSAGE: '[data-testid="test-message"]',
  
  // Elementos de referência
  LOGIN_TITLE: '[data-testid="login-title"]',
  LOGIN_FORM: '[data-testid="login-form"]'
}
```

### Classes CSS para Verificação de Estilos

```css
/* Banner de Manutenção */
.maintenance-banner {
  @apply text-red-800 bg-red-100 border-red-200;
  /* Dark mode: dark:bg-red-900/20 dark:text-red-200 dark:border-red-800 */
}

/* Banner de Teste */
.test-banner {
  @apply text-yellow-800 bg-yellow-100 border-yellow-200;
  /* Dark mode: dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800 */
}
```

## 🗄️ Estados do Banco de Dados para Testes

### Configuração de Dados de Teste

```sql
-- Cenário 1: Modo de teste ativo
UPDATE settings SET 
  marketplace_in_test = true,
  marketplace_in_maintenance = false,
  marketplace_test_message = 'O marketplace está em modo de teste. Algumas funcionalidades podem não estar disponíveis.',
  marketplace_maintenance_message = null;

-- Cenário 2: Modo de manutenção ativo
UPDATE settings SET 
  marketplace_in_test = false,
  marketplace_in_maintenance = true,
  marketplace_test_message = null,
  marketplace_maintenance_message = 'O marketplace está temporariamente em manutenção. Tente novamente em alguns minutos.';

-- Cenário 3: Ambos ativos
UPDATE settings SET 
  marketplace_in_test = true,
  marketplace_in_maintenance = true,
  marketplace_test_message = 'Sistema em teste',
  marketplace_maintenance_message = 'Sistema em manutenção';

-- Cenário 4: Nenhum ativo
UPDATE settings SET 
  marketplace_in_test = false,
  marketplace_in_maintenance = false,
  marketplace_test_message = null,
  marketplace_maintenance_message = null;

-- Cenário 5: Mensagens vazias
UPDATE settings SET 
  marketplace_in_test = true,
  marketplace_in_maintenance = true,
  marketplace_test_message = '',
  marketplace_maintenance_message = '';
```

## 🧪 Estrutura de Testes Sugerida

### Testes Unitários (Jest/Testing Library)

```typescript
// src/pages/auth/__tests__/MarketplaceStatusBanner.test.tsx
describe('MarketplaceStatusBanner', () => {
  it('should render maintenance banner when maintenance mode is active')
  it('should render test banner when test mode is active')
  it('should render both banners when both modes are active')
  it('should render maintenance banner first when both are active')
  it('should not render when no modes are active')
  it('should not render when messages are empty')
  it('should handle loading state properly')
  it('should handle error state gracefully')
})

// src/pages/auth/__tests__/useMarketplaceStatus.test.tsx
describe('useMarketplaceStatus', () => {
  it('should fetch settings on mount')
  it('should handle API errors gracefully')
  it('should parse boolean flags correctly')
  it('should handle null/undefined messages')
  it('should provide refresh functionality')
})
```

### Testes de Integração (Cypress/Playwright)

```typescript
// cypress/e2e/login-marketplace-status.cy.ts
describe('Login - Marketplace Status', () => {
  beforeEach(() => {
    // Setup database state
    cy.task('seedDatabase', { scenario: 'clean' })
  })

  it('displays maintenance banner when maintenance mode is active', () => {
    cy.task('updateSettings', {
      marketplace_in_maintenance: true,
      marketplace_maintenance_message: 'Sistema em manutenção'
    })
    
    cy.visit('/')
    cy.get('[data-testid="maintenance-banner"]').should('be.visible')
    cy.get('[data-testid="maintenance-message"]').should('contain', 'Sistema em manutenção')
  })

  it('displays test banner when test mode is active', () => {
    cy.task('updateSettings', {
      marketplace_in_test: true,
      marketplace_test_message: 'Sistema em teste'
    })
    
    cy.visit('/')
    cy.get('[data-testid="test-banner"]').should('be.visible')
    cy.get('[data-testid="test-message"]').should('contain', 'Sistema em teste')
  })

  it('displays both banners in correct order when both modes are active', () => {
    cy.task('updateSettings', {
      marketplace_in_test: true,
      marketplace_in_maintenance: true,
      marketplace_test_message: 'Teste ativo',
      marketplace_maintenance_message: 'Manutenção ativa'
    })
    
    cy.visit('/')
    
    // Verificar que ambos estão visíveis
    cy.get('[data-testid="maintenance-banner"]').should('be.visible')
    cy.get('[data-testid="test-banner"]').should('be.visible')
    
    // Verificar ordem (manutenção primeiro)
    cy.get('[data-testid="marketplace-status-container"]')
      .children()
      .first()
      .should('have.attr', 'data-testid', 'maintenance-banner')
  })

  it('works on both login routes', () => {
    cy.task('updateSettings', {
      marketplace_in_test: true,
      marketplace_test_message: 'Sistema em teste'
    })
    
    // Testar rota de usuário
    cy.visit('/')
    cy.get('[data-testid="test-banner"]').should('be.visible')
    
    // Testar rota admin
    cy.visit('/adm')
    cy.get('[data-testid="test-banner"]').should('be.visible')
  })
})
```

## 📊 Métricas de Performance para Testes

### Tempos de Carregamento Esperados
```typescript
const PERFORMANCE_BENCHMARKS = {
  // Tempo para carregar configurações do banco
  SETTINGS_FETCH_TIME: '< 500ms',
  
  // Tempo para renderizar banner após receber dados
  BANNER_RENDER_TIME: '< 100ms',
  
  // Tempo total até banner aparecer na tela
  TOTAL_DISPLAY_TIME: '< 600ms'
}
```

### Verificações de Acessibilidade
```typescript
const A11Y_CHECKS = {
  // Contraste de cores
  MAINTENANCE_BANNER_CONTRAST: '>= 4.5:1',
  TEST_BANNER_CONTRAST: '>= 4.5:1',
  
  // Suporte a screen readers
  BANNER_SEMANTIC_MARKUP: 'role="alert" ou aria-live="polite"',
  
  // Navegação por teclado
  KEYBOARD_NAVIGATION: 'Não deve interferir no foco'
}
```

## 🔧 Utilitários para Testes

### Helpers para Setup de Dados

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('setMarketplaceMode', (config: {
  testMode?: boolean;
  maintenanceMode?: boolean;
  testMessage?: string;
  maintenanceMessage?: string;
}) => {
  return cy.task('updateSettings', {
    marketplace_in_test: config.testMode || false,
    marketplace_in_maintenance: config.maintenanceMode || false,
    marketplace_test_message: config.testMessage || '',
    marketplace_maintenance_message: config.maintenanceMessage || ''
  })
})

// Uso nos testes
cy.setMarketplaceMode({
  testMode: true,
  testMessage: 'Sistema em teste'
})
```

### Mock de API para Testes Unitários

```typescript
// src/pages/auth/__tests__/__mocks__/marketplaceModeService.ts
export const mockMarketplaceModeService = {
  getMarketplaceModeSettings: jest.fn(),
  
  // Cenários pré-definidos
  mockTestModeActive: () => ({
    id: '1',
    marketplace_in_test: true,
    marketplace_in_maintenance: false,
    marketplace_test_message: 'Sistema em teste',
    marketplace_maintenance_message: null
  }),
  
  mockMaintenanceModeActive: () => ({
    id: '1',
    marketplace_in_test: false,
    marketplace_in_maintenance: true,
    marketplace_test_message: null,
    marketplace_maintenance_message: 'Sistema em manutenção'
  }),
  
  mockBothModesActive: () => ({
    id: '1',
    marketplace_in_test: true,
    marketplace_in_maintenance: true,
    marketplace_test_message: 'Teste',
    marketplace_maintenance_message: 'Manutenção'
  }),
  
  mockNoModesActive: () => ({
    id: '1',
    marketplace_in_test: false,
    marketplace_in_maintenance: false,
    marketplace_test_message: null,
    marketplace_maintenance_message: null
  })
}
```

## 🚨 Pontos Críticos para Validação

### Validações Obrigatórias
1. **Ordem de Exibição**: Manutenção sempre antes de teste
2. **Posicionamento**: Sempre acima do título "Login"
3. **Responsividade**: Funciona em mobile e desktop
4. **Dark Mode**: Cores adequadas em ambos os temas
5. **Tratamento de Erro**: Falha silenciosa sem quebrar a página
6. **Performance**: Não impacta tempo de carregamento da página

### Red Flags para Alertar nos Testes
- Banner aparece em posição incorreta
- Cores não atendem critérios de contraste
- Tempo de carregamento > 1 segundo
- Erro de JavaScript na console
- Banner não desaparece quando modo é desativado
- Mensagens vazias gerando banners vazios

---

**Data de Criação**: Agosto 2025  
**Versão**: 1.0.0  
**Propósito**: Documentação para criação de testes automatizados  
**Componentes**: Login, MarketplaceStatusBanner, useMarketplaceStatus
