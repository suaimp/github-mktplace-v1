# Sistema de Tratamento de Erros PagarMe

Este sistema oferece uma solução completa para tratar, traduzir e exibir erros do PagarMe de forma amigável ao usuário.

## Estrutura do Sistema

```
src/components/Checkout/Payment/error-handling/
├── index.ts                          # Exportações principais
├── PagarmeErrorTranslator.ts          # Tradutor de erros
├── PagarmeErrorProcessor.ts           # Processador central
├── types/
│   └── PagarmeErrorTypes.ts          # Interfaces TypeScript
├── utils/
│   └── PagarmeErrorLogger.ts         # Sistema de logging
├── hooks/
│   └── usePagarmeErrorHandler.ts     # Hook personalizado
└── components/
    └── PagarmeErrorDisplay.tsx       # Componente de exibição
```

## Principais Funcionalidades

### 1. Tradução Automática de Erros

O sistema traduz automaticamente mensagens de erro do PagarMe para português amigável:

- **"The request is invalid"** → "Os dados do cartão estão incorretos. Verifique todas as informações e tente novamente."
- **"card_declined"** → "Cartão recusado. Verifique os dados ou tente outro cartão."
- **"insufficient_funds"** → "Saldo insuficiente no cartão."

### 2. Categorização de Erros

Os erros são categorizados em 4 tipos:

- **validation**: Dados de entrada inválidos
- **card**: Problemas com o cartão de crédito
- **system**: Erros de sistema/rede
- **unknown**: Erros não identificados

### 3. Sugestões de Ação

Para cada tipo de erro, o sistema fornece sugestões específicas:

- **check_card_data**: Verificar dados do cartão
- **try_different_card**: Tentar outro cartão
- **try_again_later**: Aguardar e tentar novamente
- **contact_support**: Entrar em contato com suporte

## Como Usar

### Uso Básico

```typescript
import { handlePagarmeError } from './error-handling';

// Tradução simples de erro
const userMessage = handlePagarmeError(pagarmeError);
```

### Uso Avançado com Hook

```typescript
import { usePagarmeErrorHandler } from './error-handling';

function PaymentComponent() {
  const errorHandler = usePagarmeErrorHandler({
    component: 'PaymentForm',
    enableAutoRetry: true,
    onError: (error) => console.log('Erro:', error.message)
  });

  const handlePayment = async () => {
    try {
      await paymentService.processPayment();
    } catch (error) {
      errorHandler.handleError(error, 'payment_processing');
    }
  };

  return (
    <div>
      {errorHandler.hasError && (
        <PagarmeErrorDisplay
          error={errorHandler.error}
          onRetry={errorHandler.canRetry ? errorHandler.retry : undefined}
          onDismiss={errorHandler.clearError}
        />
      )}
    </div>
  );
}
```

### Uso com Wrapper de Função

```typescript
const errorHandler = usePagarmeErrorHandler();

// Wrapper automático para funções assíncronas
const processPaymentSafely = errorHandler.withErrorHandling(
  paymentService.processPayment,
  'payment_processing'
);

// Uso automático de tratamento de erro
const result = await processPaymentSafely(paymentData);
```

## Componente de Exibição

O `PagarmeErrorDisplay` oferece uma interface rica para exibição de erros:

- **Ícones contextuais** baseados no tipo de erro
- **Cores temáticas** (erro, aviso, informação)
- **Botão de retry** para erros recuperáveis
- **Sugestões de ação** específicas
- **Modo dark** suportado
- **Informações de debug** (apenas em desenvolvimento)

## Logging e Monitoramento

O sistema inclui logging automático com:

- **Categorização por severidade**: low, medium, high, critical
- **Contexto detalhado**: componente, ação, timestamp
- **Estatísticas de erro**: contadores por tipo e severidade
- **Integração com serviços externos** (Sentry, LogRocket)

## Erros Suportados

### HTTP Status Codes

| Código | Tradução |
|--------|----------|
| 400 | Requisição inválida. Verifique os dados enviados. |
| 401 | Erro de autenticação. Configuração do sistema inválida. |
| 403 | Acesso negado. Entre em contato com o suporte. |
| 422 | Dados inválidos. Verifique as informações do cartão. |
| 500 | Erro interno do servidor. Tente novamente. |

### Erros de Cartão

| Código Original | Tradução |
|----------------|----------|
| card_declined | Cartão recusado. Verifique os dados ou tente outro cartão. |
| insufficient_funds | Saldo insuficiente no cartão. |
| expired_card | Cartão vencido. Use um cartão válido. |
| incorrect_cvc | Código de segurança (CVV) incorreto. |
| incorrect_number | Número do cartão incorreto. |

### Erros de Validação por Campo

| Campo | Mensagem |
|-------|----------|
| order.customer.name | Nome do cliente é obrigatório. |
| card.number | Número do cartão inválido. |
| card.cvv | Código de segurança inválido. |
| billing_address.zip_code | CEP é obrigatório. |

## Princípios de Design

### 1. Responsabilidade Única
Cada arquivo tem uma responsabilidade específica:
- Tradutor: apenas tradução
- Processador: lógica de negócio
- Logger: registro de eventos
- Componente: exibição visual

### 2. Modularidade
Sistema dividido em módulos independentes que podem ser usados separadamente.

### 3. Extensibilidade
Fácil adição de novos tipos de erro, traduções e funcionalidades.

### 4. Type Safety
Todas as interfaces TypeScript garantem segurança de tipos.

## Configuração

### Habilitando Logging em Produção

```typescript
const errorHandler = usePagarmeErrorHandler({
  enableLogging: true,
  component: 'CheckoutForm'
});
```

### Configurando Auto-Retry

```typescript
const errorHandler = usePagarmeErrorHandler({
  enableAutoRetry: true,
  maxRetryAttempts: 3,
  retryDelayMs: 2000
});
```

## Integração no Projeto

O sistema está integrado no arquivo principal de pagamento (`Payment.tsx`):

1. **Hook de erro** inicializado no componente
2. **Tratamento automático** nos catches de erro
3. **Componente de exibição** renderizado na UI
4. **Retry automático** para erros de sistema

## Benefícios

1. **Experiência do usuário melhorada**: Mensagens claras e acionáveis
2. **Debugging facilitado**: Logs detalhados e categorizados
3. **Manutenibilidade**: Código organizado e modular
4. **Escalabilidade**: Fácil adição de novos tipos de erro
5. **Consistência**: Tratamento padronizado em toda aplicação

## Próximos Passos

1. **Integração com analytics**: Enviar métricas de erro
2. **Testes automatizados**: Cobertura completa do sistema
3. **Internacionalização**: Suporte a múltiplos idiomas
4. **Machine Learning**: Detecção automática de padrões de erro
