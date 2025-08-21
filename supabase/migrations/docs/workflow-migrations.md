# Workflow de Desenvolvimento com Supabase Local + Produção

## 🔄 **Processo de Sincronização Inicial**

### 1. **Após instalar Docker, execute:**
```powershell
powershell -ExecutionPolicy Bypass -File sync-production-db.ps1
```

Este script vai:
- ✅ Fazer backup das migrations atuais
- ✅ Conectar ao projeto Supabase remoto  
- ✅ Baixar o schema atual da produção
- ✅ Sincronizar migrations com estado real do banco
- ✅ Configurar ambiente para alternar local/produção

## 🏠 **Desenvolvimento Local (Recomendado)**

### Para usar banco LOCAL (dados isolados):
```powershell
# 1. Configurar ambiente local
mv .env.development .env.local

# 2. Iniciar Supabase local
npm run supabase:start

# 3. Desenvolver
npm run dev
```

**Vantagens:**
- 🚀 Rápido (sem latência)
- 🔒 Seguro (não afeta produção)
- 🧪 Pode testar migrations
- 📊 Reset fácil dos dados

## 🌐 **Desenvolvimento com Produção**

### Para usar banco PRODUÇÃO (dados reais):
```powershell
# Use o arquivo .env existente (já configurado)
npm run dev
```

**Cuidados:**
- ⚠️ Mudanças afetam dados reais
- ⚠️ Não teste migrations aqui
- ⚠️ Use apenas para debugging/consultas

## 📝 **Workflow de Migrations**

### Criando nova migration:
```powershell
# 1. Certifique-se que está com ambiente local
npm run supabase:start

# 2. Crie a migration
supabase migration new add_nova_feature

# 3. Edite o arquivo gerado em supabase/migrations/

# 4. Teste localmente
supabase db reset

# 5. Verifique se funcionou
npm run dev
```

### Aplicando em produção:
```powershell
# 1. Teste localmente primeiro!
supabase db reset

# 2. Se estiver OK, aplique em produção
supabase db push
```

## 🔀 **Alternando entre Ambientes**

### Para DESENVOLVIMENTO LOCAL:
```powershell
# Se não existir .env.local, crie:
cp .env.development .env.local

# Inicie Supabase local
npm run supabase:start

# Desenvolva
npm run dev
```

### Para PRODUÇÃO:
```powershell
# Remove .env.local (se existir)
rm .env.local

# Desenvolva (vai usar .env automaticamente)
npm run dev
```

## 📊 **Estados dos Arquivos**

```
.env          -> Produção (sempre mantido)
.env.local    -> Local (crie quando precisar)
.env.development -> Template para .env.local
```

## 🚨 **Comandos Importantes**

```powershell
# Status do Supabase local
npm run supabase:status

# Parar Supabase local
npm run supabase:stop

# Reset completo do banco local
npm run supabase:reset

# Ver logs do banco local
supabase logs db

# Ver diferenças entre local e produção
supabase db diff
```

## 🎯 **Fluxo Recomendado**

1. **Sempre desenvolva localmente primeiro**
2. **Teste todas as migrations localmente**
3. **Use produção apenas para consultas/debugging**
4. **Faça commit das migrations testadas**
5. **Aplique em produção com `supabase db push`**

## 🔐 **Credenciais**

### Local:
- URL: `http://localhost:54321`
- DB: `postgresql://postgres:postgres@localhost:54322/postgres`

### Produção:
- Configuradas no arquivo `.env`
- Project ID: encontrado na URL do Supabase Dashboard

## 📋 **Checklist de Segurança**

- [ ] ✅ Sempre teste migrations localmente
- [ ] ✅ Faça backup antes de aplicar em produção  
- [ ] ✅ Use `.env.local` para desenvolvimento
- [ ] ✅ Versione migrations no git
- [ ] ✅ Documente mudanças importantes
