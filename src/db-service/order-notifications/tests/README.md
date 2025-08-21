# 🧪 Testes do Sistema de Notificações por Email

Esta pasta contém todos os testes para verificar o funcionamento do sistema de notificações por email de mensagens.

## 📁 Estrutura dos Testes

```
src/db-service/order-notifications/tests/
├── index.ts                     # Índice principal dos testes
├── test-edge-function.js        # Teste direto da edge function
├── test-message-notification.ts # Teste completo de notificação
├── test-templates.ts           # Teste dos templates de email
└── README.md                   # Este arquivo
```

## 🚀 Como Executar os Testes

### 📦 Scripts NPM (Recomendado)

```bash
# Teste rápido dos templates
npm run test:notifications:templates

# Teste direto da edge function
npm run test:notifications:edge

# Teste completo de notificação (requer dados reais)
npm run test:notifications:message

# Executar todos os testes
npm run test:notifications:all

# Testes Jest tradicionais
npm run test:notifications
```

### 🔧 Execução Manual

#### 1. 📧 Teste dos Templates (Rápido)

Testa se os templates de email estão sendo gerados corretamente:

```bash
# No terminal
cd src/db-service/order-notifications/tests
npx ts-node test-templates.ts
```

**O que testa:**
- ✅ Geração de templates para cliente e admin
- ✅ Conteúdo dos templates (Order ID, mensagem, etc.)
- ✅ Estrutura HTML válida

### 2. 🌐 Teste da Edge Function (Direto)

Testa diretamente a edge function sem passar pelo sistema:

```bash
# No terminal (na raiz do projeto)
node src/db-service/order-notifications/tests/test-edge-function.js
```

**O que testa:**
- ✅ Conectividade com a edge function
- ✅ Envio de email via Resend
- ✅ Recepção no Inbucket local

### 3. 🔄 Teste Completo de Notificação

Testa todo o fluxo do sistema (requer dados reais):

```bash
# No terminal
cd src/db-service/order-notifications/tests
npx ts-node test-message-notification.ts
```

**O que testa:**
- ✅ OrderNotificationService.sendMessageNotification()
- ✅ Busca de dados do banco
- ✅ Geração de templates
- ✅ Envio via edge function

### 4. 🎯 Executar Todos os Testes

```bash
# No terminal
cd src/db-service/order-notifications/tests
npx ts-node index.ts
```

## 🔍 Verificando os Resultados

### 📧 Inbucket (Email Local)

Acesse http://localhost:54324 para ver os emails enviados durante os testes.

### 📊 Logs no Console

Os testes produzem logs detalhados:

```
🧪 === TESTE DOS TEMPLATES DE EMAIL ===
📧 Assunto (Cliente): Nova resposta da equipe - Pedido #test-order
🛡️ Assunto (Admin): Nova mensagem de João Silva - Pedido #test-order
✅ Template Cliente contém Order ID: true
✅ Template Admin contém Mensagem: true
🎉 TODOS OS TEMPLATES ESTÃO FUNCIONANDO CORRETAMENTE!
```

## 🐛 Diagnóstico de Problemas

### Problema: Templates não geram

**Solução:** Verifique se os tipos estão corretos:
```bash
npm run type-check
```

### Problema: Edge function não responde

**Verificações:**
1. ✅ Supabase local está rodando: `supabase status`
2. ✅ Edge function está ativa: `supabase functions list`
3. ✅ URL está correta: http://127.0.0.1:54321

### Problema: Email não chega

**Verificações:**
1. ✅ Inbucket está rodando: http://localhost:54324
2. ✅ Logs da edge function (F12 > Console)
3. ✅ Configuração RESEND_API_KEY

## 📝 Logs de Debug

O sistema possui logs detalhados que começam com:

- `💬 [EMAIL_DEBUG]` - OrderNotificationService
- `📧 [EMAIL_DEBUG]` - Envio de email
- `🔄 [EDGE_DEBUG]` - Edge function
- `🧪 [TEST_DEBUG]` - Testes

## 🔧 Configuração Necessária

### Variáveis de Ambiente

```bash
# No .env.local do Supabase
RESEND_API_KEY=your_resend_api_key_here
```

### Dados de Teste

Para o teste completo, você precisa de:
- ✅ Order ID válido no banco
- ✅ Order Item ID válido no banco
- ✅ Usuário autenticado

## 📋 Checklist de Funcionamento

- [ ] Templates geram HTML válido
- [ ] Edge function responde (status 200)
- [ ] Email aparece no Inbucket
- [ ] Logs não mostram erros
- [ ] Dados do banco são recuperados
- [ ] Notificação é enviada para destinatário correto

---

**💡 Dica:** Execute sempre o teste de templates primeiro, depois o teste da edge function, e por último o teste completo.
