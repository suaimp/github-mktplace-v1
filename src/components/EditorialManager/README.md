# Editorial Manager - Form Entry Values Fix

## Problema Identificado

O sistema apresentava um problema crítico de duplicação de registros na tabela `form_entry_values` quando múltiplos administradores editavam a mesma entrada simultaneamente.

### Cenário do Problema:
1. **Admin A** abre modal de edição → carrega valores existentes
2. **Admin B** abre o mesmo modal → carrega os mesmos valores  
3. **Admin A** salva → DELETE + INSERT (método antigo)
4. **Admin B** salva → DELETE + INSERT (cria duplicatas)
5. **Resultado**: 20 registros ao invés de 10 para o mesmo `entry_id`

## Solução Implementada

### 1. **Arquitetura Modular (Princípio de Responsabilidade Única)**

```
src/components/EditorialManager/
├── EntryEditModal.tsx                 # Componente principal
├── index.ts                          # Exports centralizados  
├── types/
│   └── entryTypes.ts                 # Definições de tipos
├── hooks/
│   ├── useFormFields.ts              # Hook para campos do formulário
│   └── useFormValues.ts              # Hook para valores do formulário  
├── services/
│   ├── formEntryValuesService.ts     # Operações CRUD na tabela
│   ├── formFieldsService.ts          # Operações de campos
│   ├── formValidationService.ts      # Validações
│   └── formSubmissionService.ts      # Lógica de submissão
└── sql/
    └── fix_form_entry_values_duplicates.sql
```

### 2. **UPSERT Strategy**

**Antes (Problemático):**
```tsx
// DELETE + INSERT (causa duplicatas)
await supabase.from("form_entry_values").delete().eq("entry_id", entry.id);
await supabase.from("form_entry_values").insert(values);
```

**Depois (Solução):**
```tsx  
// UPSERT com chave composta (previne duplicatas)
await supabase.from("form_entry_values").upsert(values, {
  onConflict: 'entry_id,field_id',
  ignoreDuplicates: false
});
```

### 3. **Constraint de Banco de Dados**

```sql
-- Garante unicidade no nível do banco
ALTER TABLE form_entry_values 
ADD CONSTRAINT unique_entry_field 
UNIQUE (entry_id, field_id);
```

## Serviços Criados

### **FormEntryValuesService**
- `upsertFormEntryValues()` - Operação UPSERT principal
- `validateFormEntryValues()` - Validação de integridade
- `getFormEntryValues()` - Consulta de valores

### **FormSubmissionService** 
- `submitFormEntry()` - Orquestra todo o processo de submissão
- Aplica validações, comissões e sincronização de preços
- Trata erros de forma granular

### **FormValidationService**
- `validateField()` - Validação individual de campos
- `validateAllFields()` - Validação completa do formulário

### **FormFieldsService**
- `loadFormFields()` - Carrega campos e configurações
- `shouldFieldBeVisible()` - Controle de visibilidade
- `mapFieldType()` - Mapeamento de tipos de campo

## Hooks Customizados

### **useFormFields**
- Gerencia estado dos campos do formulário
- Carrega configurações e settings
- Controla loading states

### **useFormValues**  
- Gerencia valores do formulário
- Parse automático de JSON
- Tratamento especial para campos específicos (niche, etc.)

## Benefícios da Solução

✅ **Elimina duplicação** - UPSERT mantém unicidade  
✅ **Operação atômica** - Reduz problemas de concorrência  
✅ **Melhor performance** - Uma operação vs DELETE + INSERT  
✅ **Código limpo** - Separação de responsabilidades  
✅ **Manutenibilidade** - Estrutura modular  
✅ **Validação robusta** - Controle de integridade  
✅ **Compatibilidade** - Funciona com múltiplos admins  

## Como Usar

### 1. **Executar Script SQL**
```bash
# Executar o script para limpar duplicatas e adicionar constraint
psql -d your_database -f src/components/EditorialManager/sql/fix_form_entry_values_duplicates.sql
```

### 2. **Import do Componente**
```tsx
import { EntryEditModal } from './components/EditorialManager';

// Uso normal - nenhuma mudança na interface pública
<EntryEditModal 
  isOpen={isOpen}
  onClose={onClose}
  entry={entry}
  onSave={onSave}
  isAdmin={isAdmin}  
/>
```

### 3. **Import de Serviços (se necessário)**
```tsx
import { 
  FormEntryValuesService,
  FormSubmissionService 
} from './components/EditorialManager';
```

## Estrutura de Dados

### **form_entry_values**
```
┌─────────────┬──────────────────────────────────────┐
│ Campo       │ Descrição                            │
├─────────────┼──────────────────────────────────────┤
│ id          │ Primary Key                          │
│ entry_id    │ ID da entrada (site)                 │  
│ field_id    │ ID do campo específico               │
│ value       │ Valor em string (URLs, números)      │
│ value_json  │ Valor JSON (arrays, objetos)         │ 
└─────────────┴──────────────────────────────────────┘

Constraint: UNIQUE(entry_id, field_id) 
```

## Testes Recomendados

1. **Teste de Concorrência**: Dois admins editando simultaneamente
2. **Teste de Validação**: Campos obrigatórios e formatos
3. **Teste de Performance**: UPSERT vs DELETE+INSERT  
4. **Teste de Integridade**: Constraint funcionando corretamente

## Monitoramento

Consulta para verificar se há duplicatas:
```sql
SELECT entry_id, field_id, COUNT(*) as duplicates
FROM form_entry_values  
GROUP BY entry_id, field_id
HAVING COUNT(*) > 1;
```

Esta solução resolve definitivamente o problema de duplicação mantendo a compatibilidade com o código existente.
