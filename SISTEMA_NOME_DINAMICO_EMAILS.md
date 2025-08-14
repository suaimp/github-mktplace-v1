# Sistema de Nome Dinâmico nos Emails

## 📝 Resumo da Implementação

O sistema de emails agora utiliza o **nome da plataforma dinamicamente** baseado no campo `site_title` salvo na tabela `settings` através da rota `/settings` (aba Logo).

## 🔧 Como Funciona

### 1. **Configuração Dinâmica**
- O nome da plataforma nos emails é obtido do banco de dados (`settings.site_title`)
- Se não houver valor salvo, usa fallback: `"Marketplace Sua Imprensa"`
- Sistema de cache de 5 minutos para performance

### 2. **Arquivos Modificados**

#### **SettingsService.ts** ✨ NOVO
- Busca configurações da plataforma do banco
- Cache simples para evitar múltiplas consultas
- Fallback automático para valores padrão

#### **config.ts** 🔄 ATUALIZADO  
- Função `getPlatformName()`: busca nome dinâmico
- Função `getDynamicFromString()`: gera string "from" completa
- Mantém configurações estáticas como fallback

#### **templates.ts** 🔄 ATUALIZADO
- Todos os templates aceitam parâmetro `platformName`
- Footer dinâmico: `"Este é um email automático do sistema ${platformName}"`
- Mantém compatibilidade com valor padrão

#### **OrderNotificationService.ts** 🔄 ATUALIZADO
- Busca nome da plataforma antes de gerar templates
- Passa nome dinâmico para todos os templates
- Usa nome dinâmico no campo "from" dos emails

#### **send-order-email/index.ts** 🔄 CORRIGIDO
- Corrigido "Seu Marketplace" → "Marketplace Sua Imprensa"

## 🎯 Benefícios

### ✅ **Nome Centralizadamente Controlado**
- Admin configura uma vez em `/settings` 
- Reflexo automático em todos os emails
- Não precisa alterar código para mudanças de branding

### ✅ **Performance Otimizada**
- Cache de 5 minutos evita consultas excessivas
- Fallback local se banco indisponível
- Logs detalhados para debugging

### ✅ **Retrocompatibilidade**
- Templates funcionam com ou sem nome dinâmico
- Fallbacks garantem que sistema nunca para
- Testes adaptados para nova assinatura

## 🔍 Fluxo Técnico

```mermaid
graph TD
    A[Admin salva título em /settings] --> B[settings.site_title armazenado]
    B --> C[Email trigger acionado]
    C --> D[SettingsService.getPlatformName()]
    D --> E[Cache válido?]
    E -->|Sim| F[Retorna nome do cache]
    E -->|Não| G[Consulta banco de dados]
    G --> H[Atualiza cache]
    H --> I[Retorna nome dinâmico]
    F --> J[Template gerado com nome]
    I --> J
    J --> K[Email enviado com nome correto]
```

## 📋 Configuração

### **1. Definir Título da Plataforma**
1. Acessar `/settings`
2. Aba "Logo" 
3. Campo "Título do site"
4. Salvar configurações

### **2. Verificar Funcionamento**
- Qualquer ação que gere email (nova pauta, artigo, etc.)
- Verificar footer: `"Este é um email automático do sistema [SEU_TITULO]"`
- Verificar campo "From": `"[SEU_TITULO] <noreply@cp.suaimprensa.com.br>"`

## 🧪 Testando

### **Teste Manual**
```javascript
// Console do navegador em /settings
const titulo = "Minha Plataforma Teste";
// Salvar via interface
// Criar nova pauta
// Verificar email recebido
```

### **Teste Programático** 
```typescript
import { SettingsService } from './SettingsService';

// Buscar configurações atuais
const settings = await SettingsService.getPlatformSettings();
console.log('Nome atual:', settings.site_title);
```

## 🔄 Migração de Dados

### **Configurações Existentes**
- Banco com `site_title = null`: usa fallback `"Marketplace Sua Imprensa"`
- Banco sem tabela settings: cria automaticamente com valores padrão
- Zero downtime na migração

### **Casos Edge**
- Erro na consulta: usa fallback local
- Cache corrompido: refaz consulta automaticamente  
- Banco indisponível: usa último valor do cache

## 🚀 Status

### ✅ **Implementado**
- [x] Serviço de configurações dinâmicas
- [x] Templates com nome variável
- [x] Sistema de cache
- [x] Logs de debugging
- [x] Fallbacks de segurança
- [x] Correção de inconsistências

### 🔄 **Casos de Uso Suportados**
- [x] Nova pauta → Nome dinâmico no email
- [x] Artigo enviado → Nome dinâmico no email  
- [x] Artigo publicado → Nome dinâmico no email
- [x] Campo "From" dinâmico
- [x] Footer dinâmico

## 📝 Logs de Debug

```
⚙️ [SettingsService] Buscando configurações da plataforma...
✅ [SettingsService] Configurações carregadas: { site_title: "Minha Plataforma" }
💾 [SettingsService] Usando configurações do cache
⚙️ [EMAIL_DEBUG] Nome da plataforma carregado: Minha Plataforma
```

## 🎨 Interface do Usuário

### **Antes**
- Nome fixo no código: "Marketplace Sua Imprensa"
- Emails sempre com mesmo nome
- Mudanças requeriam deploy

### **Depois**  
- Nome configurável via interface
- Mudança instantânea em todos os emails
- Zero código necessário para branding
