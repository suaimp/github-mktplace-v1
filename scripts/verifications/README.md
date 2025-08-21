# Verification Scripts

Este diretório contém scripts para verificar configurações e funcionalidades do sistema.

## 📁 Scripts Disponíveis

### 1. `verify-auth-config.ps1` (Principal)
Script completo para verificar configurações de autenticação do Supabase.

**Uso:**
```powershell
# Verificação básica
.\scripts\verifications\verify-auth-config.ps1

# Análise detalhada
.\scripts\verifications\verify-auth-config.ps1 -Detailed

# Testar URLs de redirect
.\scripts\verifications\verify-auth-config.ps1 -TestUrls

# Output em JSON
.\scripts\verifications\verify-auth-config.ps1 -Json
```

### 2. `verify-auth-config.js` (Node.js)
Versão em JavaScript do verificador de configurações.

**Uso:**
```bash
# Verificação básica
node scripts/verifications/verify-auth-config.js

# Com teste de URLs
node scripts/verifications/verify-auth-config.js --test-urls

# Output JSON
node scripts/verifications/verify-auth-config.js --json
```

## 🔍 O que é Verificado

### **Status do Supabase:**
- ✅ Servidor local rodando (localhost:54321)
- ✅ Endpoint de Auth acessível
- ✅ Dashboard disponível

### **Configurações de Auth:**
- ✅ Auth module habilitado
- ✅ Site URL configurado
- ✅ JWT expiry time
- ✅ Enable signup status
- ✅ Redirect URLs configuradas

### **Análise de URLs:**
- 🏠 URLs localhost (desenvolvimento)
- 🔐 Rotas de autenticação (/reset-password, /password-recovery)
- 🌐 URLs externas (produção)
- 🔌 Cobertura de portas comuns (3000, 5173, 5174)

### **Testes de Conectividade:**
- 🧪 Teste de acessibilidade das URLs localhost
- 📊 Status de resposta dos endpoints
- ⚡ Tempo de resposta

## 📊 Saída do Script

### **Exemplo de Output:**
```
🔍 Verificação: Configurações de Auth
====================================

Supabase Status: ✅ Online
Auth Endpoint: ✅ Acessível
Dashboard: http://localhost:54321

Auth Module: ✅ Habilitado
📍 Site URL: http://localhost:3000
⏱️ JWT Expiry: 3600 segundos
👤 Enable Signup: ✅ Habilitado

🔗 Redirect URLs Configuradas (8):
   🏠 http://localhost:3000
   🏠 http://localhost:5173
   🏠 http://localhost:5174
   🔐 http://localhost:3000/password-recovery
   🔐 http://localhost:5173/password-recovery
   🔐 http://localhost:5174/password-recovery
   🔐 http://localhost:3000/reset-password
   🔐 http://localhost:5173/reset-password

📊 Análise Resumida:
   🏠 URLs Localhost: 8
   🔐 Rotas de Auth: 6
   🌐 URLs Externas: 0
   🔌 Portas cobertas: 3000, 5173, 5174

🎯 Status Geral: ✅ OK
```

## ⚠️ Problemas Comuns e Soluções

### **❌ Supabase Offline**
```
Problema: Supabase Status: ❌ Offline
Solução: npx supabase start
```

### **❌ URLs não configuradas**
```
Problema: 🔗 Redirect URLs Configuradas (0)
Solução: .\scripts\url-configuration\sync-auth-urls.ps1
```

### **⚠️ Portas não cobertas**
```
Problema: Portas não cobertas: 5174
Solução: Adicionar URLs para porta 5174
```

### **❌ Auth desabilitado**
```
Problema: Auth Module: ❌ Desabilitado
Solução: Editar supabase/config.toml - enabled = true
```

## 🔧 Integração com Outros Scripts

### **Fluxo Recomendado:**
```powershell
# 1. Verificar estado atual
.\scripts\verifications\verify-auth-config.ps1

# 2. Se necessário, sincronizar configurações
.\scripts\url-configuration\sync-auth-urls.ps1

# 3. Verificar novamente
.\scripts\verifications\verify-auth-config.ps1 -TestUrls
```

### **Automação com JSON:**
```bash
# Obter status em JSON para automação
node scripts/verifications/verify-auth-config.js --json > auth-status.json

# Verificar se precisa sincronizar
$status = Get-Content auth-status.json | ConvertFrom-Json
if ($status.analysis.status -ne "ok") {
    .\scripts\url-configuration\sync-auth-urls.ps1 -Force
}
```

## 📋 Checklist de Verificação

### **✅ Configuração Ideal:**
- [ ] Supabase local rodando
- [ ] Auth module habilitado
- [ ] Site URL: `http://localhost:3000`
- [ ] Pelo menos 6 redirect URLs configuradas
- [ ] Portas 3000, 5173, 5174 cobertas
- [ ] Rotas `/reset-password` e `/password-recovery` presentes
- [ ] Todas as URLs localhost acessíveis

### **⚠️ Configuração Mínima:**
- [ ] Supabase rodando
- [ ] Auth habilitado
- [ ] Pelo menos 2 URLs de reset configuradas

## 🎯 Status Codes

| Status | Significado | Ação |
|--------|-------------|------|
| ✅ OK | Tudo funcionando | Nenhuma |
| ⚠️ WARNING | Funciona mas pode melhorar | Recomendado |
| ❌ ERROR | Problema crítico | Obrigatório |

## 🔗 Links Relacionados

- [Scripts de URL Configuration](../url-configuration/README.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Configuração Local](https://supabase.com/docs/guides/cli/local-development)
