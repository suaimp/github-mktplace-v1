# 📋 Guia Completo - Edge Functions e Secrets Manual

## 🔧 Edge Functions Identificadas (17 total)

### 1. **create-payment-intent**
- **Função**: Criar intenção de pagamento Stripe
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: STRIPE_SECRET_KEY

### 2. **create-pix-qrcode** 
- **Função**: Gerar QR Code PIX para pagamentos
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: PAGARME, PAGARME_PUBLIC_KEY

### 3. **delete-user**
- **Função**: Deletar usuário do sistema
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: SUPABASE_SERVICE_ROLE_KEY

### 4. **feedback-email**
- **Função**: Enviar emails de feedback
- **JWT**: ✅ Requer autenticação  
- **Secrets necessárias**: RESEND_API_KEY

### 5. **pagarme-installments**
- **Função**: Calcular parcelas Pagar.me
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: PAGARME, PAGARME_PUBLIC_KEY

### 6. **pagarme-payment**
- **Função**: Processar pagamento Pagar.me
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: PAGARME, PAGARME_PUBLIC_KEY

### 7. **pagarme-pix-payment**
- **Função**: Processar pagamento PIX via Pagar.me
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: PAGARME, PAGARME_PUBLIC_KEY

### 8. **pagarme-pix-status**
- **Função**: Verificar status do pagamento PIX
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: PAGARME

### 9. **pagarme-pix-webhook** ⚠️
- **Função**: Webhook para receber notificações PIX
- **JWT**: ❌ SEM autenticação (webhook)
- **Secrets necessárias**: PAGARME

### 10. **pagarme-webhook** ⚠️
- **Função**: Webhook geral Pagar.me
- **JWT**: ❌ SEM autenticação (webhook)
- **Secrets necessárias**: PAGARME

### 11. **send-order-email**
- **Função**: Enviar email de confirmação de pedido
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: RESEND_API_KEY

### 12. **send-order-notification-email**
- **Função**: Enviar notificações de pedidos
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: RESEND_API_KEY

### 13. **smtp-test**
- **Função**: Testar configurações SMTP
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: RESEND_API_KEY

### 14. **stripe-webhook** ⚠️
- **Função**: Webhook Stripe para pagamentos
- **JWT**: ❌ SEM autenticação (webhook)
- **Secrets necessárias**: STRIPE_WEBHOOK_SECRET

### 15. **test-auth**
- **Função**: Testar autenticação
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: SUPABASE_SERVICE_ROLE_KEY

### 16. **test-pix-simple**
- **Função**: Teste simples de PIX
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: PAGARME_TEST_SECRET

### 17. **test-smtp**
- **Função**: Teste simples de SMTP
- **JWT**: ✅ Requer autenticação
- **Secrets necessárias**: RESEND_API_KEY

---

## 🔐 Secrets Identificadas (10 total)

### 1. **PAGARME**
- **Descrição**: Chave secreta principal do Pagar.me
- **Usado em**: pagarme-payment, pagarme-pix-payment, pagarme-pix-status, webhooks
- **Tipo**: Chave de produção

### 2. **PAGARME_PUBLIC_KEY**
- **Descrição**: Chave pública do Pagar.me  
- **Usado em**: create-pix-qrcode, pagarme-installments, pagarme-payment
- **Tipo**: Chave pública de produção

### 3. **PAGARME_TEST_PUBLIC**
- **Descrição**: Chave pública de teste do Pagar.me
- **Usado em**: Testes e desenvolvimento
- **Tipo**: Chave pública de teste

### 4. **PAGARME_TEST_SECRET**
- **Descrição**: Chave secreta de teste do Pagar.me
- **Usado em**: test-pix-simple, desenvolvimento
- **Tipo**: Chave secreta de teste

### 5. **RESEND_API_KEY**
- **Descrição**: Chave da API Resend para envio de emails
- **Usado em**: feedback-email, send-order-email, send-order-notification-email, smtp-test
- **Tipo**: Chave de API

### 6. **STRIPE_WEBHOOK_SECRET**
- **Descrição**: Secret para validar webhooks do Stripe
- **Usado em**: stripe-webhook
- **Tipo**: Webhook secret

### 7. **SUPABASE_ANON_KEY**
- **Descrição**: Chave anônima do Supabase (produção)
- **Usado em**: Autenticação básica
- **Tipo**: Chave pública

### 8. **SUPABASE_DB_URL**
- **Descrição**: URL do banco de dados PostgreSQL
- **Usado em**: Conexões diretas ao banco
- **Tipo**: String de conexão

### 9. **SUPABASE_SERVICE_ROLE_KEY**
- **Descrição**: Chave service role do Supabase (produção)
- **Usado em**: delete-user, test-auth, operações administrativas
- **Tipo**: Chave administrativa

### 10. **SUPABASE_URL**
- **Descrição**: URL base do projeto Supabase
- **Usado em**: Inicialização do cliente Supabase
- **Tipo**: URL base

---

## 🛠️ Template para Criação Manual das Edge Functions

### Comando base para criar função:
```bash
supabase functions new nome-da-funcao
```

### Template básico TypeScript:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";

// Configuração
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    // Sua lógica aqui
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
```

### Template para Webhook (sem JWT):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  try {
    const body = await req.json();
    
    // Validar webhook signature aqui
    
    // Processar webhook
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
});
```

## 📝 Configuração no config.toml

Para cada função criada, adicionar:

```toml
# Função normal
[functions.nome-da-funcao]
enabled = true
verify_jwt = true

# Função webhook  
[functions.nome-webhook]
enabled = true
verify_jwt = false
```

## 🔐 Arquivo de Secrets

Criar `supabase/functions/.env`:
```bash
# Pagar.me
PAGARME=sua_chave_aqui
PAGARME_PUBLIC_KEY=sua_chave_aqui
PAGARME_TEST_PUBLIC=sua_chave_aqui
PAGARME_TEST_SECRET=sua_chave_aqui

# Email
RESEND_API_KEY=sua_chave_aqui

# Stripe
STRIPE_WEBHOOK_SECRET=sua_chave_aqui

# Supabase
SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_DB_URL=sua_url_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
SUPABASE_URL=sua_url_aqui
```

---

## 🚀 Comandos para Deploy

```bash
# Deploy individual
supabase functions deploy nome-da-funcao

# Deploy todas
supabase functions deploy

# Configurar secrets
supabase secrets set NOME_SECRET=valor
```

Quer que eu comece a recriar alguma função específica ou prefere que eu crie um script automatizado para recriar todas?
