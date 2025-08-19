# Guia de Sincronização Supabase Local

## 1. Inicializar e subir stack local

```bash
npx supabase init
npx supabase start
```

*(O Postgres local roda em 127.0.0.1:54322)*

## 2. Fazer login e vincular projeto remoto

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

*(Pegue o ref na URL do dashboard)*

## 3. Sincronizar schema remoto → local

```bash
npx supabase db pull          # gera migration com schema remoto
npx supabase migration up     # aplica no banco local
```

## 4. Baixar dados do banco remoto

```bash
npx supabase db dump --data-only -f supabase/data.sql
```

## 5. Restaurar dados no Postgres local (sem psql)

```bash
# Método alternativo usando Supabase CLI
Get-Content .\supabase\data.sql | npx supabase db execute
```

## Observações importantes

- `db dump` ignora schemas gerenciados (auth, storage, extensões)
- Para reexecutar tudo do zero: `npx supabase db reset`
- Use `--disable-triggers` se houver constraints circulares

## Fontes

- [CLI Getting Started](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Local Development Overview](https://supabase.com/docs/guides/local-development/overview)
- [CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Backup/Restore via CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [CLI Config](https://supabase.com/docs/guides/cli/config)
