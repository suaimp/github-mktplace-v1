/**
 * Exemplo de uso completo do sistema de tratamento de erros PagarMe
 * Este arquivo demonstra como integrar o sistema em componentes React
 */

import { useState } from 'react';
import { 
  usePagarmeErrorHandler, 
  PagarmeErrorDisplay,
  handlePagarmeError 
} from './index';

// Simulação de função de pagamento para exemplos
const mockProcessPayment = async (_data: any): Promise<any> => {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular erro ocasional para demonstração
  if (Math.random() > 0.7) {
    throw {
      message: "The request is invalid",
      errors: { "card.number": ["Invalid card number"] }
    };
  }
  
  return { success: true, payment_id: `pay_${Date.now()}` };
};
// Exemplo 1: Uso básico com tradução simples
export function SimpleErrorExample() {
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      // Simular erro do PagarMe
      const pagarmeError = {
        message: "The request is invalid",
        errors: {
          "order.payments[0].credit_card.card.number": [
            "The number field is not a valid card number"
          ]
        }
      };
      
      throw pagarmeError;
    } catch (err) {
      // Uso simples: apenas tradução
      const userFriendlyMessage = handlePagarmeError(err);
      setError(userFriendlyMessage);
    }
  };

  return (
    <div>
      <button onClick={handlePayment}>Processar Pagamento</button>
      {error && (
        <div className="text-red-600 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

// Exemplo 2: Uso avançado com hook personalizado
export function AdvancedErrorExample() {
  const errorHandler = usePagarmeErrorHandler({
    component: 'PaymentForm',
    enableAutoRetry: true,
    maxRetryAttempts: 3,
    onError: (error) => {
      console.log('Erro capturado:', error.message);
    },
    onRetry: () => {
      console.log('Tentando novamente...');
    }
  });

  const handleCreditCardPayment = async (paymentData: any) => {
    try {
      // Simular chamada para API do PagarMe
      const response = await fetch('/api/pagarme-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Estrutura típica de erro do PagarMe
        const pagarmeError = {
          message: result.error || result.message || 'The request is invalid',
          errors: result.errors,
          gateway_response: result.gateway_response,
          status: response.status
        };
        
        throw pagarmeError;
      }

      // Sucesso
      console.log('Pagamento processado:', result);
      
    } catch (error) {
      // Usar o sistema de tratamento de erros
      errorHandler.handleError(error, 'credit_card_payment');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Pagamento com Cartão</h2>
      
      {/* Formulário de pagamento */}
      <div className="space-y-4 mb-6">
        <input 
          type="text" 
          placeholder="Número do cartão"
          className="w-full p-3 border rounded"
        />
        <input 
          type="text" 
          placeholder="Nome no cartão"
          className="w-full p-3 border rounded"
        />
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="MM/AA"
            className="p-3 border rounded"
          />
          <input 
            type="text" 
            placeholder="CVV"
            className="p-3 border rounded"
          />
        </div>
      </div>

      {/* Botão de pagamento */}
      <button
        onClick={() => handleCreditCardPayment({
          // dados do pagamento
        })}
        disabled={errorHandler.isRetrying}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {errorHandler.isRetrying ? 'Tentando novamente...' : 'Processar Pagamento'}
      </button>

      {/* Informações de debug (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Has Error: {errorHandler.hasError ? 'Sim' : 'Não'}</p>
          <p>Error Type: {errorHandler.error?.type || 'N/A'}</p>
          <p>Can Retry: {errorHandler.canRetry ? 'Sim' : 'Não'}</p>
          <p>Retry Count: {errorHandler.retryCount}</p>
          <p>Is Retrying: {errorHandler.isRetrying ? 'Sim' : 'Não'}</p>
          
          {/* Verificações específicas */}
          <div className="mt-2 space-y-1">
            <p>Is Validation Error: {errorHandler.isValidationError ? 'Sim' : 'Não'}</p>
            <p>Is Card Error: {errorHandler.isCardError ? 'Sim' : 'Não'}</p>
            <p>Is System Error: {errorHandler.isSystemError ? 'Sim' : 'Não'}</p>
            <p>Needs Card Data Check: {errorHandler.needsCardDataCheck ? 'Sim' : 'Não'}</p>
            <p>Needs Different Card: {errorHandler.needsDifferentCard ? 'Sim' : 'Não'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Exemplo 3: Wrapper de função com tratamento automático
export function WrapperExample() {
  const errorHandler = usePagarmeErrorHandler({
    component: 'PaymentWrapper'
  });

  // Função original que pode falhar
  const processPayment = async (data: any) => {
    const response = await fetch('/api/payment', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    
    return response.json();
  };

  // Wrapper com tratamento automático de erro
  const safeProcessPayment = errorHandler.withErrorHandling(
    processPayment,
    'payment_processing'
  );

  const handleClick = async () => {
    const result = await safeProcessPayment({ amount: 100 });
    
    if (result) {
      console.log('Pagamento realizado:', result);
    }
    // Erros são tratados automaticamente pelo wrapper
  };

  return (
    <div>
      <button onClick={handleClick}>
        Pagamento Seguro (Auto Error Handling)
      </button>
      
      {errorHandler.hasError && (
        <PagarmeErrorDisplay
          error={errorHandler.error!}
          onDismiss={errorHandler.clearError}
        />
      )}
    </div>
  );
}

// Exemplo 4: Integração com formulários React Hook Form
export function ReactHookFormExample() {
  const errorHandler = usePagarmeErrorHandler({
    component: 'ReactHookFormPayment'
  });

  const onSubmit = async (data: any) => {
    try {
      // Validação local primeiro
      if (!data.cardNumber || !data.cvv) {
        errorHandler.handleError({
          message: 'The request is invalid',
          errors: {
            'card.number': ['The number field is required'],
            'card.cvv': ['The cvv field is required']
          }
        }, 'form_validation');
        return;
      }

      // Processar pagamento usando função mock
      await mockProcessPayment(data);
      
    } catch (error) {
      errorHandler.handleError(error, 'form_submission');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {/* campos do formulário */}
      
      {errorHandler.hasError && (
        <PagarmeErrorDisplay
          error={errorHandler.error!}
          onDismiss={errorHandler.clearError}
        />
      )}
      
      <button type="submit">Enviar</button>
    </form>
  );
}

// Exemplo 5: Tratamento de múltiplos tipos de pagamento
export function MultiPaymentExample() {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  
  const errorHandler = usePagarmeErrorHandler({
    component: 'MultiPayment'
  });

  const handlePayment = async () => {
    try {
      if (paymentMethod === 'credit_card') {
        // Lógica específica para cartão
        throw {
          message: 'card_declined',
          gateway_response: {
            code: '200',
            errors: [{ message: 'Card declined' }]
          }
        };
      } else {
        // Lógica específica para PIX
        throw {
          message: 'processing_error',
          errors: { 'pix': ['PIX service unavailable'] }
        };
      }
    } catch (error) {
      errorHandler.handleError(error, `${paymentMethod}_payment`);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label>
          <input
            type="radio"
            value="credit_card"
            checked={paymentMethod === 'credit_card'}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          />
          Cartão de Crédito
        </label>
        <label className="ml-4">
          <input
            type="radio"
            value="pix"
            checked={paymentMethod === 'pix'}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          />
          PIX
        </label>
      </div>

      <button onClick={handlePayment}>
        Pagar com {paymentMethod === 'credit_card' ? 'Cartão' : 'PIX'}
      </button>

      {errorHandler.hasError && (
        <PagarmeErrorDisplay
          error={errorHandler.error!}
          onRetry={errorHandler.canRetry ? errorHandler.retry : undefined}
          onDismiss={errorHandler.clearError}
        />
      )}
    </div>
  );
}
