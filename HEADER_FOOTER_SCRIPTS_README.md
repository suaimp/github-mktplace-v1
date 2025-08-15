# Header & Footer Scripts - Documentação

## 📋 Visão Geral

Esta funcionalidade permite aos administradores inserir códigos customizados (HTML/JavaScript) nas seções `<head>` e antes do `</body>` da aplicação, possibilitando a integração com ferramentas de analytics, tracking, chat widgets e outras soluções de terceiros.

## 🏗️ Arquitetura (Princípios SOLID)

### **Responsabilidade Única (SRP)**
- **`HeaderFooterScriptsService`**: Gerencia CRUD de scripts
- **`useHeaderFooterScripts`**: Gerencia estado do formulário
- **`useHeaderFooterToast`**: Gerencia notificações
- **`useScriptInjection`**: Gerencia injeção dinâmica de scripts
- **`HeaderFooterSettings`**: Interface do usuário

### **Aberto/Fechado (OCP)**
- Serviços extensíveis para novos tipos de validação
- Hook de injeção pode ser estendido para novos tipos de scripts

### **Substituição de Liskov (LSP)**
- Interfaces consistentes entre todos os serviços

### **Segregação de Interface (ISP)**
- Interfaces específicas para cada funcionalidade
- Tipos separados para formulário, validação e dados

### **Inversão de Dependência (DIP)**
- Componentes dependem de abstrações (hooks e serviços)
- Injeção de dependências através de props

## 📁 Estrutura de Arquivos

```
src/
├── pages/Settings/
│   ├── components/
│   │   └── HeaderFooterSettings.tsx      # Componente principal
│   ├── hooks/
│   │   ├── useHeaderFooterScripts.ts     # Estado do formulário
│   │   └── useHeaderFooterToast.ts       # Notificações
│   └── types/
│       └── headerFooterTypes.ts          # Tipos TypeScript
├── services/db-services/settings-services/
│   └── headerFooterScriptsService.ts     # CRUD e validação
├── hooks/
│   └── useScriptInjection.ts             # Injeção dinâmica
└── supabase/migrations/settings/
    └── 20250815000000_add_header_footer_scripts.sql
```

## 🎯 Funcionalidades

### **1. Interface de Administração**
- **Localização**: Settings → Header & Footer
- **Campos**:
  - Scripts do `<head>` (10.000 caracteres)
  - Scripts antes do `</body>` (10.000 caracteres)
- **Validações**: Tamanho, padrões maliciosos

### **2. Injeção Dinâmica**
- **Header Scripts**: Injetados no `<head>` do documento
- **Footer Scripts**: Injetados antes do `</body>`
- **Limpeza Automática**: Remove scripts antigos antes de inserir novos
- **Identificação**: Scripts dinâmicos marcados com `data-dynamic-*`

### **3. Segurança**
- **Validação de Padrões**: Detecta scripts maliciosos
- **Sanitização**: Remove comentários HTML perigosos
- **RLS**: Acesso restrito a administradores
- **Limite de Caracteres**: Máximo 10.000 por campo

## 🔧 Como Usar

### **1. Para Administradores**
```typescript
// Acesse: /settings → Header & Footer
// Insira códigos nos campos apropriados
// Clique em "Salvar Configurações"
```

### **2. Exemplos de Códigos**

#### **Google Analytics (Header)**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

#### **Chat Widget (Footer)**
```html
<script>
  (function() {
    var widget = document.createElement('script');
    widget.src = 'https://widget.chat.com/widget.js';
    document.body.appendChild(widget);
  })();
</script>
```

### **3. Para Desenvolvedores**

#### **Usar o Hook de Injeção**
```typescript
import { useScriptInjection } from './hooks/useScriptInjection';

function MyComponent() {
  const { injectHeaderScripts, injectFooterScripts } = useScriptInjection();
  
  // Scripts são injetados automaticamente na inicialização
  // Ou pode injetar manualmente:
  // injectHeaderScripts('<script>...</script>');
}
```

#### **Usar o Serviço Diretamente**
```typescript
import { HeaderFooterScriptsService } from './services/db-services/settings-services/headerFooterScriptsService';

// Buscar scripts
const scripts = await HeaderFooterScriptsService.getHeaderFooterScripts();

// Atualizar scripts
const success = await HeaderFooterScriptsService.updateHeaderFooterScripts(
  settingsId,
  { header_scripts: '...', footer_scripts: '...' }
);
```

## 🛡️ Segurança

### **Validações Implementadas**
- Limite de 10.000 caracteres por campo
- Detecção de padrões maliciosos:
  - `document.write`
  - `eval()`
  - `innerHTML =`
  - `javascript:void`
  - Event handlers inline (`onclick`, etc.)

### **Sanitização**
- Remove comentários HTML maliciosos
- Limpa espaços desnecessários
- Validação de formato de scripts

### **Controle de Acesso**
- RLS no banco de dados
- Apenas administradores autenticados
- Logs de alterações

## 🚀 Deploy

### **1. Migração do Banco**
```bash
npx supabase db push
```

### **2. Verificar Funcionamento**
1. Acesse `/settings`
2. Clique na aba "Header & Footer"
3. Insira um script de teste
4. Salve e verifique no DevTools

## 📊 Monitoramento

### **Logs Úteis**
- `✅ Scripts de header injetados com sucesso`
- `✅ Scripts de footer injetados com sucesso`
- `🧹 Scripts dinâmicos removidos`
- `❌ Erro ao injetar scripts`

### **Debug**
```javascript
// No console do navegador
document.querySelectorAll('[data-dynamic-header="true"]')
document.querySelectorAll('[data-dynamic-footer="true"]')
```

## 🔄 Manutenção

### **Limpeza de Scripts**
```typescript
const { removeInjectedScripts } = useScriptInjection();
removeInjectedScripts(); // Remove todos os scripts dinâmicos
```

### **Recarregar Scripts**
```typescript
const { loadAndInjectScripts } = useScriptInjection();
loadAndInjectScripts(); // Recarrega do banco e injeta
```

## 🎨 Casos de Uso Comuns

1. **Google Analytics / Tag Manager**
2. **Facebook Pixel**
3. **Chat Widgets (Intercom, Zendesk)**
4. **Scripts de Remarketing**
5. **Meta Tags Dinâmicas**
6. **Códigos de Verificação (Search Console)**
7. **Fontes Customizadas**
8. **Scripts de A/B Testing**

## ⚠️ Limitações

- Máximo 10.000 caracteres por campo
- Scripts são executados em todas as páginas
- Não há controle granular por página
- Validação básica de segurança (não 100% à prova de falhas)

## 🛠️ Futuras Melhorias

- [ ] Controle por página/rota específica
- [ ] Preview de scripts antes de salvar
- [ ] Histórico de alterações
- [ ] Templates de scripts populares
- [ ] Validação mais rigorosa de segurança
- [ ] Modo de teste/sandbox
