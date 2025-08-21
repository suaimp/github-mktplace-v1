# Edge Functions e Secrets - Guia de Configuração

Este documento explica como configurar e gerenciar Edge Functions e secrets no ambiente local e produção.

## Estrutura de Arquivos

```
supabase/functions/
├── .env                    # Configuração de PRODUÇÃO (não commitar)
├── .env.local             # Configuração de DESENVOLVIMENTO
├── function1/
├── function2/
└── ...
```

## Configuração de Ambientes

### 🔧 Desenvolvimento Local (`.env.local`)

O arquivo `.env.local` contém valores seguros para desenvolvimento:

- **Supabase URLs**: Apontam para o ambiente local (localhost:54321)
- **API Keys**: Placeholders ou keys de teste
- **Serviços Externos**: Configurações sandbox/teste

**Características:**
- ✅ Pode ser commitado no Git
- ✅ Valores não sensíveis
- ✅ Pronto para desenvolvimento

### 🚀 Produção (`.env`)

O arquivo `.env` deve conter os valores reais de produção:

- **Supabase URLs**: URLs reais da produção
- **API Keys**: Chaves reais dos serviços
- **Secrets**: Valores sensíveis reais

**Características:**
- ❌ NUNCA commitado no Git
- ⚠️ Valores sensíveis
- 🔒 Apenas para produção

## Edge Functions Disponíveis

### 📋 Status Atual

```powershell
# Verificar functions localmente
supabase functions list

# Functions ativas no projeto:
# - analytics-track
# - auth-callback
# - create-payment
# - email-notification
# - form-handler
# - send-whatsapp
# - webhook-payment
# ... (total: 22 functions)
```

### 🚀 Comandos Úteis

```powershell
# Servir functions localmente
supabase functions serve

# Servir function específica
supabase functions serve function-name

# Ver logs
supabase functions logs function-name

# Deploy para produção
supabase functions deploy function-name

# Deploy todas
supabase functions deploy
```

## Secrets Management

### 📝 Listar Secrets Disponíveis

```powershell
# Listar todos os secrets do projeto
supabase secrets list --linked

# Output esperado:
# NAME                     | DIGEST
# SUPABASE_URL            | sha256:abc123...
# SUPABASE_ANON_KEY       | sha256:def456...
# PAGARME                 | sha256:ghi789...
# RESEND_API_KEY          | sha256:jkl012...
```

### 🔧 Configuração Manual

Como os valores reais dos secrets não podem ser obtidos via CLI por segurança, você deve:

1. **Acessar o Dashboard do Supabase**
   ```
   https://supabase.com/dashboard/project/uxbeaslwirkepnowydfu/settings/edge-functions
   ```

2. **Copiar os valores reais** de cada secret

3. **Atualizar o arquivo `.env`** com os valores corretos

### 🔒 Secrets Principais

| Secret | Descrição | Uso |
|--------|-----------|-----|
| `SUPABASE_URL` | URL do projeto Supabase | Conexão com banco |
| `SUPABASE_ANON_KEY` | Chave anônima | Acesso público |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço | Operações privilegiadas |
| `PAGARME` | API Key do Pagar.me | Processamento de pagamentos |
| `RESEND_API_KEY` | API Key do Resend | Envio de emails |
| `STRIPE_WEBHOOK_SECRET` | Secret do Stripe | Validação de webhooks |

## Processo de Configuração Completa

### 1. Setup Inicial

```powershell
# 1. Verificar functions existentes
supabase functions list

# 2. Verificar secrets disponíveis
supabase secrets list --linked

# 3. Iniciar servidor local
supabase functions serve
```

### 2. Configuração de Desenvolvimento

O arquivo `.env.local` já está configurado com valores seguros para desenvolvimento.

### 3. Configuração de Produção

```powershell
# 1. Acesse o Dashboard do Supabase
# 2. Vá para Settings > Edge Functions
# 3. Copie os valores reais de cada secret
# 4. Cole no arquivo .env
```

## Troubleshooting

### ❌ Function não carrega secrets

**Problema**: Function não consegue acessar variáveis de ambiente

**Solução**:
```powershell
# Verificar se o arquivo .env.local existe
Get-ChildItem "supabase\functions\.env.local"

# Reiniciar servidor de functions
supabase functions serve
```

### ❌ Erro 401 em APIs externas

**Problema**: API Keys inválidas ou expiradas

**Solução**:
1. Verificar se as keys no `.env.local` são válidas
2. Para produção, atualizar valores no `.env`
3. Verificar se os secrets no Dashboard estão atualizados

### ❌ Function não encontrada

**Problema**: Function existe no diretório mas não aparece

**Solução**:
```powershell
# Verificar estrutura de diretórios
Get-ChildItem "supabase\functions\" -Recurse

# Cada function deve ter:
# - pasta com nome da function
# - arquivo index.ts dentro da pasta
```

## Comandos de Verificação

```powershell
# Status completo do ambiente
supabase status

# Listar functions
supabase functions list

# Verificar secrets
supabase secrets list --linked

# Testar function específica
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Segurança

### ✅ Boas Práticas

1. **Nunca committar** arquivos `.env` com dados reais
2. **Usar `.env.local`** para desenvolvimento
3. **Rotacionar secrets** periodicamente
4. **Verificar logs** para vazamentos acidentais

### 🚨 Avisos Importantes

- ⚠️ **`.env`** contém dados sensíveis - NUNCA commitar
- ✅ **`.env.local`** é seguro para Git
- 🔒 **Secrets** só são visíveis no Dashboard do Supabase
- 📝 **Logs** podem conter informações sensíveis

---

## Status Atual

- ✅ **22 Edge Functions** configuradas localmente
- ✅ **16 Functions** ativas na produção
- ✅ **`.env.local`** configurado para desenvolvimento
- ✅ **`.env`** preparado para produção
- ✅ **Servidor local** funcionando na porta 54321

**Última atualização**: 21/08/2025  
**Próximos passos**: Configurar valores reais no `.env` para testes de produção
