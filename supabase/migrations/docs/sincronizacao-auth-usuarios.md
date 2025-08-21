# Sincronização de Usuários Auth - Produção para Local

Este documento explica como sincronizar os dados de autenticação (usuários) da produção para o ambiente local de desenvolvimento.

## Problema Identificado

Durante a sincronização de dados, foi identificado que mesmo com dumps completos sendo realizados com sucesso, alguns dados específicos do schema `auth` podem não ser importados corretamente, resultando em discrepâncias entre:
- **Produção**: 26 usuários auth
- **Local (antes da correção)**: 1 usuário auth

## Solução: Import Específico do Schema Auth

### 1. Gerar Dump Específico do Auth

```powershell
# Gerar dump apenas do schema auth com dados
supabase db dump --data-only --schema auth -f supabase/auth_completo.sql
```

### 2. Verificar Conteúdo do Dump

```powershell
# Verificar se os usuários esperados estão no arquivo
Select-String -Path "supabase\auth_completo.sql" -Pattern "andre@suaimprensa\.com\.br|moisesazevedo2020@gmail\.com|claudivan\.menezes@gmail\.com"
```

### 3. Backup e Limpeza do Auth Local

```powershell
# Conectar ao banco local e limpar tabelas auth
docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "TRUNCATE auth.users CASCADE;"
```

**⚠️ ATENÇÃO:** O comando `TRUNCATE auth.users CASCADE` irá:
- Limpar todos os usuários
- Limpar todas as sessões
- Limpar todas as identidades
- Limpar dados relacionados em tabelas do schema público que dependem de auth.users

### 4. Importar Dados Auth Completos

```powershell
# Importar o dump auth completo
Get-Content "supabase\auth_completo.sql" | docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres
```

### 5. Verificar Import

```powershell
# Verificar total de usuários importados
docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "SELECT COUNT(*) as total_users FROM auth.users;"

# Verificar usuários específicos com nomes
docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "SELECT id, email, raw_user_meta_data->>'first_name' as first_name, raw_user_meta_data->>'last_name' as last_name FROM auth.users ORDER BY created_at;"
```

## Usuários Críticos Verificados

Os seguintes usuários devem estar presentes após a sincronização:

| Email | Nome | Tipo |
|-------|------|------|
| `andre@suaimprensa.com.br` | Andre Luiz | Admin |
| `moisesazevedo2020@gmail.com` | Moises Azevedo | Admin |
| `moiseszeu@gmail.com` | Moises Azevedo | User |
| `adilson@suaimprensa.com.br` | Adilson Piovan | User |
| `claudivan.menezes@gmail.com` | Claudivan Menezes | User |

## Verificação de Integridade

### Contagem Esperada
- **Produção**: 26 usuários
- **Local (após import)**: 26 usuários ✅

### Comando de Verificação Rápida
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN raw_app_meta_data->>'role' = 'admin' THEN 1 END) as admin_users
FROM auth.users;
```

## Troubleshooting

### Erro: "duplicate key value violates unique constraint"
- **Causa**: Dados parciais já existem no banco
- **Solução**: Execute o TRUNCATE antes do import

### Erro: "Usuário não possui permissões de administrador"
- **Causa**: Após TRUNCATE CASCADE, as tabelas `admins` e `platform_users` ficaram vazias
- **Solução**: Reimportar dados completos (public + auth) com `dados_auth_recentes.sql`
- **Verificação**: 
  ```powershell
  # Verificar se admins foram importados
  docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "SELECT COUNT(*) FROM admins;"
  ```

### Erro: Container não encontrado
```powershell
# Verificar containers em execução
docker ps

# Usar nome correto do container
docker exec supabase_db_github-mktplace-v1 [comando]
```

### Verificar Hash do Arquivo
```powershell
# Verificar integridade do dump
Get-FileHash "supabase\auth_completo.sql" -Algorithm MD5
```

## Fluxo Completo - Comandos

```powershell
# 1. Gerar dump auth específico
supabase db dump --data-only --schema auth -f supabase/auth_completo.sql

# 2. Verificar arquivo
Get-Item "supabase\auth_completo.sql"

# 3. Limpar dados locais (⚠️ Remove auth + todas tabelas relacionadas)
docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "TRUNCATE auth.users CASCADE;"

# 4. Importar apenas auth (se quiser apenas usuários)
Get-Content "supabase\auth_completo.sql" | docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres

# 5. ⚠️ IMPORTANTE: Reimportar dados completos para restaurar tabelas relacionadas
Get-Content "supabase\dados_auth_recentes.sql" | docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres

# 6. Verificar resultado final
docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "SELECT COUNT(*) as total_users FROM auth.users; SELECT COUNT(*) as total_admins FROM admins;"
```

## Notas Importantes

1. **Backup**: Sempre faça backup antes de executar TRUNCATE
2. **Ordem**: Execute na ordem exata para evitar problemas de dependências
3. **Verificação**: Sempre verifique o resultado final
4. **Frequência**: Execute quando houver discrepâncias entre prod/local
5. **Segurança**: Nunca execute em produção - apenas local → local

## Data da Última Sincronização
- **Data**: 21/08/2025 11:44:56
- **Usuários Sincronizados**: 26 ✅
- **Admins Sincronizados**: 5 ✅
- **Platform Users**: 17 ✅
- **Status**: ✅ Sucesso - Login funcionando

---
*Documentação criada em: 21/08/2025*  
*Última atualização: 21/08/2025*
