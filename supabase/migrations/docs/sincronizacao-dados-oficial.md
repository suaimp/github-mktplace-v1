# 🎯 Sincronização de Dados Supabase - Método Oficial Funcionando

## ✅ Método Correto para Puxar Dados de Produção

Este é o **método oficial** testado e funcionando para sincronizar dados do banco de produção para o ambiente local, incluindo dados dos schemas `public` e `auth`.

### 📋 Pré-requisitos

1. **Supabase CLI instalado** (versão 2.30.4 ou superior)
2. **Projeto linkado** ao remoto
3. **Docker** rodando localmente
4. **Supabase local** iniciado (`supabase start`)

### 🔄 Fluxo Completo de Sincronização

#### 1. Verificar Status do Projeto

```bash
supabase status
supabase projects list
```

Garantir que o projeto está linkado corretamente (símbolo ● deve aparecer).

#### 2. Fazer Dump dos Dados Remotos (PUBLIC + AUTH)

```bash
# Comando OFICIAL da documentação Supabase
supabase db dump --data-only --schema public,auth -f supabase/full_data.sql
```

**Por que este comando funciona:**
- `--data-only`: Extrai apenas dados, não schemas
- `--schema public,auth`: Inclui explicitamente os schemas public E auth
- `-f arquivo.sql`: Salva em arquivo específico

#### 3. Resetar Banco Local (Aplicar Migrations)

```bash
supabase db reset
```

Isso aplica todas as migrations locais no banco, garantindo que o schema está atualizado.

#### 4. Aplicar Dados de Produção

```bash
# PowerShell (Windows)
Get-Content "supabase\full_data.sql" | docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres --set ON_ERROR_STOP=off

# Bash (Linux/Mac)
cat supabase/full_data.sql | docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres --set ON_ERROR_STOP=off
```

**Parâmetros importantes:**
- `--set ON_ERROR_STOP=off`: Continua mesmo com erros de constraints duplicadas
- Usa Docker diretamente para bypass de problemas de encoding

#### 5. Verificar Dados Importados

```sql
-- Verificar contagens principais
SELECT COUNT(*) as auth_users FROM auth.users;
SELECT COUNT(*) as platform_users FROM public.platform_users;
SELECT COUNT(*) as orders FROM public.orders;
SELECT COUNT(*) as form_entries FROM public.form_entries;
SELECT COUNT(*) as admins FROM public.admins;
```

### 📊 Resultados Esperados

Após a sincronização bem-sucedida, você deve ter:

- ✅ **Usuários Auth**: Dados do sistema de autenticação
- ✅ **Platform Users**: Usuários da plataforma  
- ✅ **Orders**: Pedidos reais de produção
- ✅ **Form Entries**: Formulários preenchidos
- ✅ **Admins**: Administradores do sistema
- ✅ **Coupons**: Cupons de desconto
- ✅ **Contracts**: Contratos ativos
- ✅ **User Stats**: Estatísticas de usuários

### ⚠️ Problemas Conhecidos e Soluções

#### 1. Constraints Circulares
**Erro**: `circular foreign-key constraints`  
**Solução**: O parâmetro `--set ON_ERROR_STOP=off` resolve automaticamente

#### 2. Chaves Duplicadas  
**Erro**: `duplicate key value violates unique constraint`  
**Solução**: Normal durante re-importação. Dados existentes são mantidos.

#### 3. Migration Removendo Tabelas
**Problema**: Migration `remote_schema.sql` pode remover tabelas criadas em migrations anteriores  
**Solução**: Recriar tabelas manualmente após importação se necessário

### 🔗 Documentação Oficial

- **Comando Principal**: [supabase db dump](https://supabase.com/docs/reference/cli/supabase-db-dump)
- **Schemas Auth/Storage**: [Local Development - Auth](https://supabase.com/docs/guides/cli/local-development#use-auth-locally)
- **CLI Reference**: [Supabase CLI](https://supabase.com/docs/reference/cli)

### 🎉 Confirmação de Sucesso

Quando o processo é bem-sucedido, você verá:

```
INSERT 0 6305  # Dados auth
INSERT 0 25    # Platform users
INSERT 0 483   # Form entries
INSERT 0 428   # Outros dados
...
```

E o comando de verificação retornará contagens reais de dados de produção.

---

## 📝 Notas Importantes

1. **Backup primeiro**: Sempre faça backup dos dados locais importantes antes da sincronização
2. **Migrations atualizadas**: Execute `supabase db reset` antes de importar para garantir schema atualizado  
3. **Tamanho do dump**: Arquivos grandes (6MB+) são normais em produção
4. **Frequência**: Execute conforme necessário para manter dados locais atualizados

---

**Data da documentação**: 20/08/2025  
**Testado com**: Supabase CLI v2.30.4, Docker Desktop  
**Status**: ✅ Funcionando em produção
