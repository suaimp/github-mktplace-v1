# Sistema de Configuração Global de Links

Este documento explica como configurar globalmente todos os links do projeto para serem `nofollow` por padrão.

## 🎯 Objetivo

Garantir que todos os links externos do projeto sejam automaticamente configurados com `rel="nofollow"` para melhorar o SEO e controle de link juice.

## 🚀 Implementação

### 1. Configuração Automática Global

O hook `useGlobalLinkConfig` foi adicionado ao `App.tsx` para configurar automaticamente todos os links do DOM:

```tsx
// App.tsx
import { useGlobalLinkConfig } from "./hooks/useGlobalLinkConfig";

export default function App() {
  // Configuração global para links serem nofollow por padrão
  useGlobalLinkConfig({
    enforceNofollow: true,
    excludeInternalLinks: true,
    addSecurityAttributes: true,
  });
  
  return (
    // ... resto do app
  );
}
```

### 2. Componente ExternalLink

Para links controlados manualmente, use o componente `ExternalLink`:

```tsx
import { ExternalLink } from '../components/ui/link/ExternalLink';

// Link externo padrão (nofollow)
<ExternalLink href="https://example.com">
  Clique aqui
</ExternalLink>

// Link externo com dofollow (para parceiros autorizados)
<ExternalLink href="https://partner.com" preset="externalDofollow">
  Parceiro Autorizado
</ExternalLink>

// Configuração customizada
<ExternalLink 
  href="https://example.com"
  linkConfig={{ nofollow: false, noopener: true }}
>
  Link Customizado
</ExternalLink>
```

### 3. Utilitários para Links Dinâmicos

Para criar links programaticamente:

```tsx
import { createLinkConfig, LINK_PRESETS } from '../utils/linkConfig';

// Auto-detecta tipo de link
const linkProps = createLinkConfig("https://example.com");
<a {...linkProps}>Link Automático</a>

// Com preset específico
const partnerProps = createLinkConfig("https://partner.com", "externalDofollow");
<a {...partnerProps}>Parceiro</a>
```

## 📋 Presets Disponíveis

### `external` (Padrão)
- `nofollow: true`
- `noopener: true` 
- `noreferrer: true`
- `target: "_blank"`

### `externalDofollow`
- `nofollow: false`
- `noopener: true`
- `noreferrer: true` 
- `target: "_blank"`

### `internal`
- `nofollow: false`
- `noopener: false`
- `noreferrer: false`
- `target: "_self"`

### `internalNewTab`
- `nofollow: false`
- `noopener: true`
- `noreferrer: false`
- `target: "_blank"`

## 🔧 Como Funciona

1. **Configuração Automática**: O hook `useGlobalLinkConfig` escaneia o DOM e adiciona `rel="nofollow"` para todos os links externos que não tenham explicitamente `rel="dofollow"`.

2. **Observer Pattern**: Usa MutationObserver para processar links adicionados dinamicamente.

3. **Detecção Inteligente**: Diferencia automaticamente entre links internos e externos.

4. **Segurança**: Adiciona automaticamente `noopener noreferrer` para links que abrem em nova aba.

## 🎨 Configuração CSS

No `index.css`, foram adicionadas classes utilitárias:

```css
/* Configuração global para links externos serem nofollow por padrão */
a[href^="http"]:not([rel*="dofollow"]) {
  /* Adiciona nofollow automaticamente para links externos */
}

/* Classe utilitária para forçar nofollow */
.link-nofollow {
  /* Usado em componentes específicos */
}

/* Classe utilitária para forçar dofollow */
.link-dofollow {
  /* Usado quando queremos explicitamente dofollow */
}
```

## 📝 Marketplace Específico

Para links no marketplace, você pode usar:

```tsx
// Em tabelas do marketplace
import { ExternalLink } from '../components/ui/link/ExternalLink';

// Link para site externo (nofollow por padrão)
<ExternalLink href={site.url} className="btn btn-primary">
  Visitar Site
</ExternalLink>

// Link para parceiro autorizado (dofollow)
<ExternalLink 
  href={partner.url} 
  preset="externalDofollow"
  className="btn btn-secondary"
>
  Parceiro Verificado
</ExternalLink>
```

## ✅ Vantagens

1. **Automático**: Todos os links são processados automaticamente
2. **Flexível**: Permite exceções quando necessário
3. **SEO-Friendly**: Controle preciso do link juice
4. **Seguro**: Adiciona atributos de segurança automaticamente
5. **Performance**: Observer eficiente para links dinâmicos

## 🔍 Verificação

Para verificar se está funcionando:

1. Abra o DevTools
2. Inspecione qualquer link externo
3. Verifique se contém `rel="nofollow noopener noreferrer"`
4. Links internos não devem ter `nofollow`

## 🚨 Exceções

Para permitir dofollow em um link específico, adicione explicitamente:

```html
<a href="https://partner.com" rel="dofollow">Parceiro</a>
```

O sistema respeitará essa configuração e não adicionará `nofollow`.
