# URL Configuration Scripts

Este diretório contém scripts para gerenciar configurações de URLs de autenticação do Supabase.

## 📁 Scripts Disponíveis

### 1. `sync-auth-urls.ps1` (Principal)
Sincroniza as configurações de URLs de autenticação para o ambiente local.

**Uso:**
```powershell
# Execução padrão (interativa)
.\scripts\url-configuration\sync-auth-urls.ps1

# Execução sem confirmação
.\scripts\url-configuration\sync-auth-urls.ps1 -Force

# Pular o restart do Supabase
.\scripts\url-configuration\sync-auth-urls.ps1 -SkipRestart

# URL personalizada
.\scripts\url-configuration\sync-auth-urls.ps1 -SiteUrl "http://localhost:4000"
```

**O que faz:**
- ✅ Atualiza `site_url` no config.toml
- ✅ Configura `additional_redirect_urls` com URLs localhost
- ✅ Inclui rotas `/reset-password` e `/password-recovery`
- ✅ Reinicia Supabase local automaticamente
- ✅ Cria backup da configuração atual

### 2. `check-auth-config.ps1`
Verifica as configurações atuais de autenticação.

**Uso:**
```powershell
# Verificação básica
.\scripts\url-configuration\check-auth-config.ps1

# Análise detalhada
.\scripts\url-configuration\check-auth-config.ps1 -Detailed

# Output em JSON
.\scripts\url-configuration\check-auth-config.ps1 -Json
```

### 3. `sync-auth-urls.js` (Node.js)
Versão em JavaScript do script de sincronização.

**Uso:**
```bash
node scripts/url-configuration/sync-auth-urls.js
```

## 🔧 URLs Configuradas Automaticamente

O script configura as seguintes URLs para desenvolvimento local:

### Base URLs:
- `http://localhost:3000`
- `http://localhost:5173` (Vite)
- `http://localhost:5174` (Vite alternativo)

### Reset Password URLs:
- `http://localhost:3000/password-recovery`
- `http://localhost:5173/password-recovery`
- `http://localhost:5174/password-recovery`
- `http://localhost:3000/reset-password`
- `http://localhost:5173/reset-password`
- `http://localhost:5174/reset-password`

## 🚀 Solução para o Problema

### **Problema Original:**
As notificações de reset de senha funcionavam em produção (`cp.suaimprensa.com.br`) mas não no Netlify (`mktplace-v1-test.netlify.app`) nem no localhost.

### **Causa:**
O Supabase Auth só envia emails de reset para URLs pré-cadastradas na configuração **Redirect URLs** do dashboard.

### **Solução:**
1. **Produção:** Adicionar URLs no dashboard do Supabase
2. **Local:** Usar estes scripts para sincronizar configurações

## 📋 Fluxo de Uso Recomendado

### 1. Primeiro uso:
```powershell
# Verificar configuração atual
.\scripts\url-configuration\check-auth-config.ps1

# Sincronizar URLs
.\scripts\url-configuration\sync-auth-urls.ps1
```

### 2. Verificação pós-sincronização:
```powershell
# Verificar se foi aplicado corretamente
.\scripts\url-configuration\check-auth-config.ps1 -Detailed
```

### 3. Teste:
- Testar reset de senha no localhost
- Verificar se emails são enviados

## ⚠️ Importante

### **Configuração Manual Necessária (Produção):**
Para URLs de produção, você ainda precisa configurar manualmente no dashboard do Supabase:
- `https://mktplace-v1-test.netlify.app/password-recovery`
- `https://mktplace-v1-test.netlify.app/reset-password`

### **Backup Automático:**
Os scripts criam backup automático do `config.toml` antes de modificar:
- Backup salvo como: `supabase/config.toml.backup`

## 🔍 Troubleshooting

### Problema: Supabase não reinicia
```powershell
# Restart manual
npx supabase stop
npx supabase start
```

### Problema: URLs não são aplicadas
```powershell
# Verificar se o config.toml foi modificado
.\scripts\url-configuration\check-auth-config.ps1 -Detailed

# Restaurar backup se necessário
Copy-Item "supabase\config.toml.backup" "supabase\config.toml"
```

### Problema: Permissão negada
```powershell
# Executar como administrador ou ajustar política de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Links Úteis

- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Auth URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)
