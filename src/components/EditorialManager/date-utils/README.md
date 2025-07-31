# Date Utils Module

Este módulo é responsável pelo processamento e formatação de datas no EditorialManager.

## Responsabilidade Única
- Formatação de timestamps UTC para horário local brasileiro
- Processamento de diferentes formatos de data do banco
- Conversão de fusos horários

## Estrutura
```
date-utils/
├── README.md              # Documentação do módulo
├── formatters/
│   ├── formatDateBr.ts    # Formatação específica para Brasil
│   └── index.ts           # Exportações do módulo
├── hooks/
│   ├── useDateFormat.ts   # Hook para formatação customizada
│   └── index.ts           # Exportações dos hooks
└── types/
    ├── dateTypes.ts       # Tipos relacionados a datas
    └── index.ts           # Exportações dos tipos
```

## Como funciona a coluna updated_at
1. **Backend**: `FormEntriesService` busca `updated_at` do Supabase
2. **Processamento**: Campo é incluído no payload da API
3. **Frontend**: `EntriesTable` usa `formatDate()` para exibir
4. **Sincronização**: `useTableDataSync` atualiza em tempo real

## Trigger de atualização no banco
Para que `updated_at` seja atualizado automaticamente:
```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON form_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```
