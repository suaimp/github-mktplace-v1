# 📧 Como Funciona o Sistema de Envio de Email

## 📋 Visão Geral

O sistema de notificações por email funciona da seguinte forma:

### 🔄 Fluxo Principal

1. **Evento Disparador**: Quando uma mensagem é enviada no chat
2. **Dupla Notificação**:
   - 📱 **Dashboard**: Notificação em tempo real no painel administrativo
   - 📧 **Email**: Notificação por email para os destinatários apropriados

## 🎯 Regras de Notificação por Email

### 📨 Quando o CLIENTE envia mensagem:

```
Cliente → Mensagem → ✅ ADMIN recebe EMAIL
                  → ❌ Cliente NÃO recebe email
```

- **Destinatário**: `contato@suaimprensa.com.br` (email do admin)
- **Remetente**: `Marketplace Sua Imprensa <noreply@cp.suaimprensa.com.br>`
- **Assunto**: `Nova mensagem de [Nome do Cliente] - Pedido #[OrderID]`

### 🛡️ Quando o ADMIN envia mensagem:

```
Admin → Mensagem → ✅ CLIENTE recebe EMAIL
                → ❌ Admin NÃO recebe email
```

- **Destinatário**: Email do cliente (do pedido)
- **Remetente**: `Marketplace Sua Imprensa <noreply@cp.suaimprensa.com.br>`
- **Assunto**: `Nova resposta da equipe - Pedido #[OrderID]`

## ⚙️ Arquitetura Técnica

### 1. 🎭 Serviços Envolvidos

```typescript
// Quando uma mensagem é criada
OrderChatService.createMessage() → {
  // 1. Salva mensagem no banco
  // 2. Envia notificação dashboard
  ChatNotificationService.sendChatNotifications()
  // 3. Envia notificação por email
  OrderNotificationService.sendMessageNotification()
}
```

### 2. 🏗️ Estrutura do OrderNotificationService

```typescript
OrderNotificationService.sendMessageNotification(
  orderId: string,
  orderItemId: string,
  messageData: {
    message: string;
    senderName: string;
    senderType: 'user' | 'admin';
  }
)
```

### 3. 📧 Templates de Email

#### Para Clientes (quando admin envia):
```html
<h2>Nova resposta da equipe</h2>
<p>Olá [Nome do Cliente],</p>
<p>Você recebeu uma nova resposta da nossa equipe para o seu pedido:</p>
<div class="message-content">[Mensagem]</div>
```

#### Para Admins (quando cliente envia):
```html
<h2>Nova mensagem de cliente</h2>
<p>O cliente [Nome] enviou uma nova mensagem:</p>
<div class="message-content">[Mensagem]</div>
```

### 4. 🚀 Edge Function

A função `send-order-notification-email` utiliza:

- **Provedor**: Resend API
- **Configuração**: 
  - API Key: `RESEND_API_KEY`
  - From: `noreply@cp.suaimprensa.com.br`
  - Nome: Dinâmico (configurações da plataforma)

## 🔍 Exemplo Prático

### Cenário 1: Cliente envia mensagem

```
1. Cliente João envia: "Quando ficará pronto?"
2. Sistema identifica: senderType = 'user'
3. Email é enviado para: contato@suaimprensa.com.br
4. Assunto: "Nova mensagem de João Silva - Pedido #abc123"
5. Conteúdo: Template com a mensagem do cliente
```

### Cenário 2: Admin responde

```
1. Admin Maria responde: "Ficará pronto em 2 dias"
2. Sistema identifica: senderType = 'admin'
3. Email é enviado para: joao@email.com (email do cliente)
4. Assunto: "Nova resposta da equipe - Pedido #abc123"
5. Conteúdo: Template com a resposta da equipe
```

## 🛠️ Configurações

### Email Config (`src/db-service/order-notifications/config.ts`)

```typescript
export const EMAIL_CONFIG = {
  ADMIN_EMAIL: 'contato@suaimprensa.com.br',
  FROM_EMAIL: 'noreply@cp.suaimprensa.com.br',
  FROM_NAME: 'Marketplace Sua Imprensa' // Fallback
}
```

### Nome Dinâmico da Plataforma

O sistema busca o nome da plataforma dinamicamente das configurações:

```typescript
const platformName = await getPlatformName();
// Retorna o valor de 'site_title' das configurações
// Fallback para 'Marketplace Sua Imprensa'
```

## 🔒 Segurança e Validações

1. **Autenticação**: Usuário deve estar logado
2. **Autorização**: Admins verificados via tabela `admins` + `roles`
3. **Dados do Pedido**: Validação de existência do pedido e item
4. **Rate Limiting**: Controlado pela Edge Function
5. **CORS**: Configurado para aceitar requisições do frontend

## 📊 Logs e Debug

O sistema possui logs detalhados:

```
💬 [EMAIL_DEBUG] === INICIANDO NOTIFICAÇÃO DE MENSAGEM ===
💬 [EMAIL_DEBUG] Parâmetros recebidos: {...}
⚙️ [EMAIL_DEBUG] Nome da plataforma carregado: ...
📧 [EMAIL_DEBUG] Gerando templates de mensagem...
👤 [EMAIL_DEBUG] Cliente enviou mensagem, admin notificado: SUCESSO
💬 [EMAIL_DEBUG] === RESULTADO MENSAGEM === {...}
```

## 🎯 Resumo das Regras

| Quem Envia | Quem Recebe Email | Email Destinatário |
|------------|-------------------|-------------------|
| 👤 Cliente | 🛡️ Admin | `contato@suaimprensa.com.br` |
| 🛡️ Admin | 👤 Cliente | Email do cliente (do pedido) |

✅ **Resultado**: Sistema garante que sempre há notificação por email para a parte que precisa ser informada!
