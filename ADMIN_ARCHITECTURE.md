# Sistema de Verificação de Admin - Arquitetura SOLID

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   ├── auth/
│   │   └── AdminService.ts          # Serviço principal para verificação de admin
│   └── admin.ts                     # Barrel export para módulos de admin
├── types/
│   └── admin.ts                     # Interfaces e tipos relacionados a admin
├── utils/
│   └── adminUtils.ts                # Utilitários para admin (cache, etc.)
└── hooks/
    ├── useAdminCheck.ts             # Hook básico para verificação de admin
    └── useAdminOperations.ts        # Hook avançado para operações de admin
```

## 🎯 Princípios SOLID Aplicados

### **S - Single Responsibility Principle (Responsabilidade Única)**

- **`AdminService`**: Responsável apenas pela lógica de verificação de admin
- **`useAdminCheck`**: Responsável apenas pelo estado da verificação
- **`useAdminOperations`**: Responsável apenas por operações que requerem admin
- **`AdminUtils`**: Responsável apenas por utilitários relacionados a admin

### **O - Open/Closed Principle (Aberto/Fechado)**

- Classes podem ser estendidas sem modificar código existente
- Interfaces bem definidas permitem novas implementações

### **L - Liskov Substitution Principle (Substituição de Liskov)**

- Interfaces padronizadas garantem substituibilidade
- Hooks podem ser substituídos mantendo contratos

### **I - Interface Segregation Principle (Segregação de Interface)**

- Interfaces específicas para cada necessidade (`AdminCheckResult`, `AdminRole`, etc.)
- Hooks especializados para diferentes casos de uso

### **D - Dependency Inversion Principle (Inversão de Dependência)**

- Hooks dependem de abstrações (serviços), não implementações
- Serviços são injetáveis e testáveis

## 🔧 Como Usar

### **Verificação Simples de Admin**
```typescript
import { useAdminCheck } from '../../hooks/useAdminCheck';

function MyComponent() {
  const { isAdmin, loading, error } = useAdminCheck();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return isAdmin ? <AdminPanel /> : <UserPanel />;
}
```

### **Operações Avançadas de Admin**
```typescript
import { useAdminOperations } from '../../hooks/useAdminOperations';

function AdminComponent() {
  const { canPerformAdminAction, executeIfAdmin } = useAdminOperations();
  
  const handleAdminAction = async () => {
    await executeIfAdmin(async () => {
      // Ação que só admin pode fazer
      await deleteOrder(orderId);
    });
  };
  
  return (
    <button 
      onClick={handleAdminAction}
      disabled={!canPerformAdminAction()}
    >
      Ação de Admin
    </button>
  );
}
```

### **Verificação Programática**
```typescript
import { AdminService } from '../services/admin';

// Verificar usuário específico
const isUserAdmin = await AdminService.isUserAdmin(userId);

// Verificar usuário atual
const isCurrentAdmin = await AdminService.isCurrentUserAdmin();
```

## 📊 Critérios de Verificação

Um usuário é considerado **admin** quando atende **TODOS** os critérios:

1. ✅ **Usuário autenticado** no sistema
2. ✅ **Existe na tabela `admins`** com o ID do usuário
3. ✅ **Campo `role` = "admin"** na tabela admins
4. ✅ **Campo `role_id`** corresponde ao ID do role "admin" da tabela `roles`

### **Consulta SQL Equivalente**
```sql
SELECT a.id 
FROM admins a
JOIN roles r ON a.role_id = r.id
WHERE a.id = $userId 
  AND a.role = 'admin' 
  AND r.name = 'admin'
```

## ⚡ Performance

- **Cache inteligente**: Resultados são cachados por 5 minutos
- **Verificação assíncrona**: Não bloqueia a UI
- **Logs detalhados**: Para debug e monitoramento

## 🧪 Testabilidade

- **Serviços mockáveis**: `AdminService` pode ser facilmente mocado
- **Hooks isolados**: Cada hook pode ser testado independentemente
- **Utilitários puros**: Funções sem efeitos colaterais

## 🔄 Migração

Para migrar código existente:

```typescript
// ❌ Antes (código duplicado)
const [isAdmin, setIsAdmin] = useState(false);
useEffect(() => {
  // código complexo de verificação...
}, []);

// ✅ Depois (código limpo)
const { isAdmin } = useAdminCheck();
```
