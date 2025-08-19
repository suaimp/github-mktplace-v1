# 🔐 SECRETS COMPLETAS - Supabase Edge Functions

## ✅ Todas as 17 Edge Functions existem localmente!

Baseado na análise dos arquivos, aqui estão todas as secrets necessárias:

## 🏦 Secrets de Pagamento

### Pagar.me (Produção)
```bash
PAGARME=pk_live_xxxxxxxxxxxx
PAGARME_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
```

### Pagar.me (Teste)
```bash
PAGARME_TEST_PUBLIC=pk_test_xxxxxxxxxxxx
PAGARME_TEST_SECRET=sk_test_xxxxxxxxxxxx
```

### Stripe
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## 📧 Secrets de Email

### Resend API
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## 🗄️ Secrets do Supabase (Produção)

```bash
SUPABASE_URL=https://uxbeaslwirkepnowydfu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@...
```

---

## 📝 Como Configurar as Secrets

### 1. Via Supabase CLI (Recomendado)
```bash
# Definir uma secret por vez
supabase secrets set PAGARME=sua_chave_aqui
supabase secrets set RESEND_API_KEY=sua_chave_aqui

# Verificar secrets definidas
supabase secrets list
```

### 2. Via Dashboard Web
1. Acesse: https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions
2. Vá para aba "Secrets"
3. Adicione cada secret uma por uma

### 3. Via Arquivo Local (somente para desenvolvimento)
Criar `supabase/functions/.env`:
```bash
PAGARME=sua_chave_pagarme
PAGARME_PUBLIC_KEY=sua_chave_publica_pagarme
PAGARME_TEST_PUBLIC=sua_chave_teste_publica
PAGARME_TEST_SECRET=sua_chave_teste_secreta
RESEND_API_KEY=sua_chave_resend
STRIPE_SECRET_KEY=sua_chave_stripe
STRIPE_WEBHOOK_SECRET=sua_webhook_secret_stripe
SUPABASE_ANON_KEY=sua_chave_anonima_producao
SUPABASE_DB_URL=sua_url_banco_producao
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_producao
SUPABASE_URL=sua_url_projeto_producao
```

---

## 🎯 Prioridade das Secrets

### 🔴 **CRÍTICAS** (Pagamentos não funcionarão sem elas)
1. **PAGARME** - Processamento de pagamentos
2. **PAGARME_PUBLIC_KEY** - Interface de pagamento
3. **STRIPE_WEBHOOK_SECRET** - Receber confirmações Stripe
4. **RESEND_API_KEY** - Emails de confirmação

### 🟡 **IMPORTANTES** (Funcionalidades específicas)
5. **PAGARME_TEST_SECRET** - Testes de pagamento
6. **PAGARME_TEST_PUBLIC** - Interface de teste
7. **SUPABASE_SERVICE_ROLE_KEY** - Operações administrativas

### 🟢 **OPCIONAIS** (Já configuradas ou automáticas)
8. **SUPABASE_URL** - Já conhecida
9. **SUPABASE_ANON_KEY** - Já conhecida
10. **SUPABASE_DB_URL** - Para operações diretas no banco

---

## 🧪 Testando as Secrets

### 1. Testar Pagar.me
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/test-pix-simple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sua_chave_jwt" \
  -d '{"amount": 1000}'
```

### 2. Testar Email
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/smtp-test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sua_chave_jwt" \
  -d '{"email": "test@test.com"}'
```

### 3. Testar Stripe
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sua_chave_jwt" \
  -d '{"amount": 1000, "currency": "brl"}'
```

---

## 🚨 IMPORTANTE: Segurança

⚠️ **NUNCA** commite secrets no Git!
⚠️ **SEMPRE** use secrets de teste para desenvolvimento
⚠️ **VERIFIQUE** se o `.env` está no `.gitignore`

---

## 📋 Checklist de Configuração

- [ ] PAGARME configurado
- [ ] PAGARME_PUBLIC_KEY configurado  
- [ ] RESEND_API_KEY configurado
- [ ] STRIPE_WEBHOOK_SECRET configurado
- [ ] Secrets de teste configuradas
- [ ] Edge Functions testadas
- [ ] Webhooks funcionando
- [ ] Emails sendo enviados

---

## 🎉 Próximos Passos

1. **Obter valores reais** das secrets de produção
2. **Configurar via CLI** ou Dashboard
3. **Testar cada função** individualmente
4. **Validar webhooks** em ambiente de teste
5. **Monitorar logs** para possíveis erros

Com todas as secrets configuradas, seu ambiente estará **100% funcional**!
