# Sistema de Toast para EditorialManager

## Visão Geral

Sistema modular de toast que substitui o `ToastMessage` personalizado pelo `showToast` global do projeto, mantendo o princípio de responsabilidade única.

## Estrutura de Pastas

```
src/components/EditorialManager/toast/
├── types/
│   └── toastTypes.ts           # Tipos TypeScript
├── services/
│   └── EntryToastService.ts    # Serviço com mensagens padrão
├── hooks/
│   └── useEntryToast.ts        # Hook personalizado
└── index.ts                    # Exportações centralizadas
```

## Componentes

### 📋 **Tipos (toastTypes.ts)**
- `ToastType`: Union type para "success" | "error"
- `EntryToastMessages`: Interface com mensagens padronizadas
- `ToastConfig`: Configuração base de toast

### 🛠️ **Serviço (EntryToastService.ts)**
Centraliza as mensagens de toast específicas do EditorialManager:
- `showEntryUpdated()`: Toast de sucesso para entrada atualizada
- `showEntrySaved()`: Toast de sucesso para alterações salvas
- `showUpdateFailed()`: Toast de erro para falha na atualização
- `showUnexpectedError()`: Toast de erro inesperado
- `showValidationError()`: Toast de erro de validação
- `showCustom()`: Toast customizado

### 🎣 **Hook (useEntryToast.ts)**
Hook que encapsula o uso do serviço, fornecendo uma API simples:
```tsx
const { 
  showEntryUpdated, 
  showUpdateFailed, 
  showUnexpectedError 
} = useEntryToast();
```

## Como Usar

### No EntryEditModal
```tsx
import { useEntryToast } from "./toast";

export default function EntryEditModal() {
  const { 
    showEntryUpdated, 
    showUpdateFailed, 
    showUnexpectedError 
  } = useEntryToast();

  const handleSubmit = async () => {
    try {
      // ... lógica de submit
      if (result.success) {
        showEntryUpdated(); // ✅ Toast de sucesso
      } else {
        showUpdateFailed(result.error); // ❌ Toast de erro
      }
    } catch (error) {
      showUnexpectedError(); // ❌ Toast de erro inesperado
    }
  };
}
```

## Benefícios

### ✅ **Vantagens da Refatoração**
1. **Consistência**: Usa o mesmo sistema de toast do marketplace
2. **Modularidade**: Estrutura organizada com responsabilidades separadas
3. **Reutilização**: Mensagens padronizadas e reutilizáveis
4. **Manutenibilidade**: Fácil modificação de mensagens centralizadas
5. **Performance**: Remove código de toast personalizado desnecessário

### 🎯 **Comparação**

#### Antes (ToastMessage personalizado):
```tsx
const [toasts, setToasts] = useState([]);
const toastId = useRef(0);

function addToast(message, type) {
  setToasts(prev => [...prev, { id: ++toastId.current, message, type }]);
}

// JSX complexo para renderizar toasts
{toasts.map((toast, idx) => (
  <ToastMessage key={toast.id} ... />
))}
```

#### Depois (Sistema global):
```tsx
const { showEntryUpdated, showUpdateFailed } = useEntryToast();

// Uso simples
showEntryUpdated(); // ✅
showUpdateFailed("Erro customizado"); // ❌
```

## Mensagens Padrão

### 🎉 **Sucesso**
- `"Entrada atualizada com sucesso!"`
- `"Alterações salvas com sucesso!"`

### ❌ **Erro**
- `"Erro ao atualizar entrada"`
- `"Erro inesperado ao atualizar entrada"`
- `"Erro de validação nos dados"`

## Princípios Aplicados

- **Responsabilidade Única**: Cada arquivo tem uma função específica
- **Modularidade**: Estrutura de pastas organizada e escalável
- **Centralização**: Mensagens e lógica centralizadas
- **Reutilização**: Hook e serviço reutilizáveis em outros contextos
- **Consistência**: Alinhado com o padrão global do projeto
