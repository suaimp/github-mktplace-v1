# Sistema de Status do Marketplace - Páginas de Login

Este documento explica a implementação do sistema de exibição de status do marketplace nas páginas de login (`/` e `/adm`).

## 📋 Visão Geral

O sistema exibe automaticamente mensagens de aviso quando o marketplace está em:
- **Modo de Teste**: Aviso amarelo com mensagem personalizada
- **Modo de Manutenção**: Aviso vermelho com mensagem personalizada
- **Ambos os modos**: Exibe ambas as mensagens (manutenção primeiro, depois teste)

## 🗂️ Estrutura de Arquivos

### Hook de Status (Business Logic)
```
src/pages/auth/hooks/
└── useMarketplaceStatus.ts         # Hook para verificar status (somente leitura)
```

### Componente de UI (Presentation Layer)
```
src/pages/auth/components/
└── MarketplaceStatusBanner.tsx     # Banner de avisos visuais
```

### Integração
```
src/pages/auth/
└── Login.tsx                       # Página de login modificada
```

## 🔄 Fluxo de Funcionamento

### 1. Carregamento da Página
```typescript
Login.tsx 
  ↓
MarketplaceStatusBanner.tsx
  ↓
useMarketplaceStatus.ts
  ↓
MarketplaceModeService.getMarketplaceModeSettings()
  ↓
Database (settings table)
```

### 2. Exibição Condicional
- **Nenhum modo ativo**: Banner não aparece
- **Modo de teste ativo**: Banner amarelo com ícone de info
- **Modo de manutenção ativo**: Banner vermelho com ícone de alerta
- **Ambos ativos**: Dois banners (manutenção primeiro, depois teste)

### 3. Design Responsivo
- Design adaptado para dark/light mode
- Ícones SVG apropriados para cada tipo de aviso
- Cores semânticas (vermelho para manutenção, amarelo para teste)

## 📡 API do Hook `useMarketplaceStatus`

### Interface de Retorno
```typescript
interface UseMarketplaceStatusReturn {
  settings: MarketplaceModeSettings | null;  // Configurações completas
  loading: boolean;                          // Estado de carregamento
  isTestMode: boolean;                       // Se modo de teste está ativo
  isMaintenanceMode: boolean;                // Se modo de manutenção está ativo
  testMessage: string;                       // Mensagem do modo de teste
  maintenanceMessage: string;                // Mensagem do modo de manutenção
  refreshSettings: () => Promise<void>;      // Recarregar configurações
}
```

### Características
- ✅ **Somente leitura**: Não permite alteração das configurações
- ✅ **Carregamento automático**: Busca dados na inicialização
- ✅ **Tratamento de erros**: Falha silenciosa (assume modos desativados)
- ✅ **Performance**: Carregamento único por sessão

## 🎨 Componente `MarketplaceStatusBanner`

### Responsabilidades
- Consumir dados do hook `useMarketplaceStatus`
- Renderizar mensagens condicionalmente
- Aplicar estilos visuais apropriados
- Gerenciar estados de loading

### Comportamento Visual

#### Banner de Manutenção (Prioridade Alta)
```tsx
// Cor: Vermelho
// Ícone: Triângulo de alerta
// Posição: Primeiro (se ambos ativos)
<div className="text-red-800 bg-red-100 border-red-200">
  {maintenanceMessage}
</div>
```

#### Banner de Teste (Prioridade Normal)
```tsx
// Cor: Amarelo
// Ícone: Círculo de informação
// Posição: Segundo (se ambos ativos)
<div className="text-yellow-800 bg-yellow-100 border-yellow-200">
  {testMessage}
</div>
```

## 🎯 Integração com Login.tsx

### Localização do Banner
```tsx
<AuthLayout>
  <div className="flex flex-col flex-1">
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div>
        {/* Título e descrição */}
        
        {/* Banner de Status do Marketplace */}
        <div className="mb-6">
          <MarketplaceStatusBanner />
        </div>
        
        {/* Mensagens de erro */}
        {/* Formulário */}
      </div>
    </div>
  </div>
</AuthLayout>
```

### Funciona em Ambas as Rotas
- ✅ `/` - Login de usuários da plataforma
- ✅ `/adm` - Login administrativo
- ✅ Lógica compartilhada, design consistente

## 🚀 Como Funciona na Prática

### Para Usuários Finais
1. Acessa `/` ou `/adm`
2. Se marketplace em teste → vê banner amarelo
3. Se marketplace em manutenção → vê banner vermelho
4. Se ambos → vê ambos os banners
5. Mensagens são personalizáveis via `/settings`

### Para Administradores
1. Configura modos em `/settings` → aba "Marketplace"
2. Ativa toggles e define mensagens personalizadas
3. Mensagens aparecem automaticamente nas páginas de login
4. Pode desativar modos quando necessário

## 🏗️ Arquitetura e Princípios SOLID

### Single Responsibility Principle
- ✅ `useMarketplaceStatus`: Apenas gerencia estado de leitura
- ✅ `MarketplaceStatusBanner`: Apenas renderiza UI
- ✅ `MarketplaceModeService`: Apenas operações de banco

### Open/Closed Principle
- ✅ Extensível para novos tipos de modo sem modificar código existente
- ✅ Pode adicionar novos estilos de banner facilmente

### Dependency Inversion
- ✅ Componente UI depende de abstração (hook)
- ✅ Hook depende de abstração (service)

## 🔧 Tratamento de Erros e Edge Cases

### Cenários de Erro
```typescript
// Se falha ao buscar configurações
catch (error) {
  console.error('Erro ao carregar status do marketplace:', error);
  // Assume modos desativados (não bloqueia login)
  setIsTestMode(false);
  setIsMaintenanceMode(false);
}
```

### Estados de Loading
- Durante carregamento: Banner não aparece
- Após carregamento: Mostra banners se necessário
- Em caso de erro: Comportamento silencioso

### Mensagens Vazias
- Se mensagem estiver vazia: Banner não aparece
- Validação no componente evita renders desnecessários

## 📝 Considerações de UX

### Prioridade Visual
1. **Manutenção** (vermelho) - mais crítico
2. **Teste** (amarelo) - menos crítico

### Acessibilidade
- ✅ Ícones SVG com `aria-hidden` implícito
- ✅ Cores contrastantes para leitura
- ✅ Suporte a dark mode
- ✅ Mensagens claras e descritivas

### Performance
- ✅ Carregamento único por sessão
- ✅ Renderização condicional
- ✅ Sem polling ou updates em tempo real

## 📋 Próximos Passos (Opcional)

### Possíveis Melhorias
1. **Cache**: Implementar cache local das configurações
2. **Real-time**: WebSocket para updates em tempo real
3. **Histórico**: Log de quando modos foram ativados/desativados
4. **Agendamento**: Programar ativação/desativação automática

### Integração com Outras Páginas
Este mesmo padrão pode ser aplicado em:
- Página de registro
- Páginas públicas
- Checkout (para bloquear compras)

---

**Última atualização**: Agosto 2025  
**Versão**: 1.0.0  
**Integração**: Sistema de Configurações Marketplace
