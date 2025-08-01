# Sistema de Contratos - Documentação Completa

Este documento descreve o sistema completo de gerenciamento de contratos implementado para o marketplace, incluindo migração de banco de dados, serviços, hooks e componentes.

## 📋 Visão Geral

O sistema permite que administradores criem, editem e gerenciem diferentes tipos de contratos através de um editor de texto rico integrado ao banco de dados Supabase.

### Características Principais

- ✅ **Acesso Restrito**: Apenas administradores podem manipular contratos
- ✅ **Tipos de Contrato**: Suporte a três tipos (Termos e Condições, Contrato PF, Contrato CNPJ)
- ✅ **Editor Rico**: Interface moderna com Tiptap para edição de texto
- ✅ **Persistência**: Dados salvos automaticamente no banco de dados
- ✅ **Validação**: Controle de permissões e validação de dados
- ✅ **Arquitetura Modular**: Separação clara de responsabilidades

## 🗄️ Estrutura do Banco de Dados

### Tabela `contracts`

```sql
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  contract_type contract_type_enum NOT NULL,
  contract_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(admin_id, contract_type)
);
```

### Enum `contract_type_enum`

```sql
CREATE TYPE contract_type_enum AS ENUM (
  'termos_condicoes',
  'contrato_pf', 
  'contrato_cnpj'
);
```

### Políticas RLS (Row Level Security)

- **Inserção**: Apenas admins autenticados
- **Seleção**: Apenas admins autenticados podem ver seus próprios contratos
- **Atualização**: Apenas admins podem atualizar seus próprios contratos
- **Exclusão**: Apenas admins podem excluir seus próprios contratos

## 📁 Estrutura de Arquivos

```
src/
├── pages/Settings/contracts/
│   ├── types/
│   │   └── contract.types.ts           # Definições de tipos TypeScript
│   ├── services/db-services/contracts/
│   │   └── contractDbService.ts        # Serviço de banco de dados
│   ├── hooks/
│   │   └── useContracts.ts            # Hook React para gerenciamento de estado
│   ├── components/
│   │   └── EnhancedContractEditor.tsx # Componente editor integrado
│   └── ContractEditorTestPage.tsx     # Página de teste/demonstração
├── hooks/
│   └── useAuth.ts                     # Hook de autenticação
└── supabase/migrations/
    └── 20250801143246_create_contracts_table.sql
```

## 🔧 Componentes do Sistema

### 1. contractDbService.ts
**Propósito**: Camada de serviço para operações de banco de dados

**Principais Métodos**:
- `createContract()`: Cria novo contrato
- `getContractById()`: Busca contrato por ID
- `getContractByAdminAndType()`: Busca contrato específico de um admin
- `updateContract()`: Atualiza contrato existente
- `deleteContract()`: Remove contrato
- `upsertContract()`: Cria ou atualiza contrato

### 2. useContracts.ts
**Propósito**: Hook React para gerenciamento de estado e operações

**Funcionalidades**:
- Estados de loading e erro
- Operações CRUD encapsuladas
- Callbacks com useCallback para otimização

### 3. EnhancedContractEditor.tsx
**Propósito**: Componente de interface integrado com banco de dados

**Características**:
- Autenticação automática de administradores
- Carregamento de contratos existentes
- Salvamento automático no banco
- Interface responsiva com dark mode
- Tratamento de erros e estados de loading

### 4. contract.types.ts
**Propósito**: Definições de tipos TypeScript para type safety

**Tipos Principais**:
- `ContractType`: Enum dos tipos de contrato
- `Contract`: Interface do contrato
- Tipos de resposta para operações CRUD

## 🚀 Como Usar

### 1. Implementação Básica

```tsx
import EnhancedContractEditor from './components/EnhancedContractEditor';

function ContractsPage() {
  return (
    <EnhancedContractEditor
      type="terms"
      title="Termos e Condições"
      onSave={(content) => {
        console.log('Contrato salvo:', content);
      }}
    />
  );
}
```

### 2. Usando o Hook Diretamente

```tsx
import { useContracts } from './hooks/useContracts';

function CustomComponent() {
  const { 
    contracts, 
    loading, 
    error, 
    upsertContract 
  } = useContracts();

  const handleSave = async () => {
    const result = await upsertContract(
      'admin-id', 
      'termos_condicoes', 
      'Conteúdo do contrato'
    );
    console.log('Resultado:', result);
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      <button onClick={handleSave}>Salvar Contrato</button>
    </div>
  );
}
```

### 3. Usando o Serviço Diretamente

```tsx
import { ContractDbService } from './services/db-services/contracts/contractDbService';

// Criar ou atualizar contrato
const contract = await ContractDbService.upsertContract(
  'admin-id',
  'contrato_pf', 
  'Conteúdo do contrato PF'
);

// Buscar contrato específico
const existingContract = await ContractDbService.getContractByAdminAndType(
  'admin-id', 
  'contrato_pf'
);
```

## 🔄 Mapeamento de Tipos Legacy

O sistema suporta tipos legados através de mapeamento automático:

```typescript
const mapLegacyTypeToDbType = (legacyType: string): ContractType => {
  switch (legacyType) {
    case 'terms':
      return 'termos_condicoes';
    case 'contract_pf':
      return 'contrato_pf';
    case 'contract_cnpj':
      return 'contrato_cnpj';
    default:
      return 'termos_condicoes';
  }
};
```

## 🔐 Segurança e Permissões

### Validações Implementadas

1. **Autenticação**: Verificação automática de usuário logado
2. **Autorização**: Confirmação de role de administrador
3. **RLS**: Políticas de segurança no nível do banco de dados
4. **Validação de Conteúdo**: Verificação de conteúdo não vazio

### Verificação de Admin

O sistema verifica se o usuário é admin através de:
1. Tabela `admins` (prioritária)
2. Tabela `platform_users` (fallback)
3. Validação do `role_id` contra tabela `roles`

## 🧪 Teste do Sistema

### Página de Teste
O arquivo `ContractEditorTestPage.tsx` fornece uma interface completa para testar todas as funcionalidades:

- Seletor de tipos de contrato
- Editor integrado com banco de dados
- Painel informativo com detalhes técnicos
- Interface responsiva para demonstração

### Executar Testes

1. Execute a migração do banco de dados
2. Acesse a página de teste como administrador
3. Teste criação, edição e salvamento de contratos
4. Verifique persistência dos dados no banco

## 📝 Exemplo de Migração

```sql
-- Arquivo: 20250801143246_create_contracts_table.sql

-- 1. Criar enum para tipos de contrato
CREATE TYPE contract_type_enum AS ENUM (
  'termos_condicoes',
  'contrato_pf', 
  'contrato_cnpj'
);

-- 2. Criar tabela de contratos
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  contract_type contract_type_enum NOT NULL,
  contract_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(admin_id, contract_type)
);

-- 3. Ativar RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS (admin-only)
CREATE POLICY "Admins can insert their own contracts" ON contracts
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND 
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- ... demais políticas
```

## 🎯 Próximos Passos

### Melhorias Futuras
1. **Versionamento**: Histórico de alterações de contratos
2. **Templates**: Sistema de templates predefinidos
3. **Assinatura Digital**: Integração com assinatura eletrônica
4. **Notificações**: Alertas para alterações de contratos
5. **Auditoria**: Log detalhado de operações

### Monitoramento
- Logs de acesso e modificações
- Métricas de uso por admin
- Backup automático de contratos importantes

---

**Desenvolvido com**: TypeScript, React, Supabase, Tiptap, Tailwind CSS

**Arquitetura**: Modular, seguindo princípios SOLID e Clean Architecture
