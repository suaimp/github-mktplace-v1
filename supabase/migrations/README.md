# Migrations Structure

Este diretório contém as migrações do banco de dados organizadas por tabela/feature.

## Estrutura Recomendada

```
migrations/
├── notification_types/
│   └── 20250820180844_create_notification_types.sql
├── orders/
│   └── [migrations relacionadas a orders]
├── users/
│   └── [migrations relacionadas a users]
├── admins/
│   └── [migrations relacionadas a admins]
└── [outras tabelas]/
    └── [respectivas migrations]
```

## Convenções

1. **Nomenclatura de pastas**: Use o nome da tabela principal em snake_case
2. **Nomenclatura de arquivos**: `YYYYMMDDHHMMSS_description.sql`
3. **Organização**: Cada tabela tem sua própria pasta para facilitar manutenção
4. **Histórico**: Mantenha todas as migrations para rastreabilidade

## Como aplicar migrations

Para aplicar todas as migrations:
```bash
supabase db reset
```

Para aplicar migrations específicas:
```bash
supabase migration up
```

## Notas

- As migrations antigas na raiz estão sendo gradualmente reorganizadas
- Novas migrations devem seguir esta estrutura organizada
- Sempre teste as migrations em ambiente local antes de aplicar em produção
