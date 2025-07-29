# Niche Rendering System

Sistema otimizado para renderização de ícones de nicho com atualizações em tempo real.

## Arquitetura

### 🏗️ Princípio de Responsabilidade Única

Cada módulo tem uma responsabilidade específica:

- **`types/`** - Definições de interfaces TypeScript
- **`services/`** - Lógica de negócio e gerenciamento de dados
- **`hooks/`** - Gerenciamento de estado React
- **`components/`** - Componentes de UI

### 📦 Módulos

#### Services

- **`nicheDataService.ts`** - Singleton para cache e busca de dados de nichos
- **`nicheCacheManager.ts`** - Gerencia invalidação de cache em tempo real
- **`nicheValueParser.ts`** - Parse e validação de valores de nicho

#### Hooks

- **`useNiches.ts`** - Hook básico para carregamento de nichos
- **`useNichesWithRealTimeUpdates.ts`** - Hook com atualizações em tempo real

#### Components

- **`NicheRenderer.tsx`** - Componente principal que renderiza todos os nichos
- **`NicheIcon.tsx`** - Componente individual de ícone de nicho
- **`NicheLoadingSkeleton.tsx`** - Estado de carregamento

## 🚀 Funcionalidades

### Cache Inteligente
- **Singleton Pattern**: Uma única instância carrega os dados
- **Invalidação Automática**: Detecta mudanças na tabela `form_field_niche`
- **Performance**: Evita múltiplas requisições desnecessárias

### Tempo Real
- **Supabase Realtime**: Escuta mudanças na database
- **Auto-refresh**: Components são atualizados automaticamente
- **Gestão de Recursos**: Cleanup automático de listeners

### Otimização de Renderização
- **Loading States**: Skeleton enquanto carrega
- **Error Handling**: Tratamento robusto de erros
- **Memory Management**: Cleanup adequado de recursos

## 🔄 Fluxo de Dados

1. `NicheRenderer` usa `useNichesWithRealTimeUpdates`
2. Hook solicita dados via `nicheDataService.getAllNiches()`
3. Service retorna cache (se disponível) ou busca da database
4. `nicheCacheManager` escuta mudanças em `form_field_niche`
5. Quando detecta mudança, invalida cache e notifica hooks
6. Hooks recarregam dados e re-renderizam components

## 🛠️ Como Usar

```tsx
import { NicheRenderer } from './niche_rendering';

// Uso básico
<NicheRenderer value={nicheData} />
```

## 🔧 Resolução de Problemas

### Problema Original
Os ícones de nicho carregavam lentamente porque cada célula da tabela fazia sua própria requisição para a database.

### Solução Implementada
- **Cache Centralizado**: Uma única requisição carrega todos os nichos
- **Real-time Updates**: Mudanças são refletidas instantaneamente
- **Arquitetura Modular**: Fácil manutenção e extensão
