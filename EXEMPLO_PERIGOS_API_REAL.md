# ⚠️ PERIGOS DE USAR API REAL DA PAGAR.ME NOS TESTES

## 🚨 EXEMPLO DE TESTE PERIGOSO (NÃO FAZER):

```typescript
// ❌ TESTE PERIGOSO - USA API REAL
import PagarMe from 'pagarme';

describe('PIX Payment - API REAL', () => {
  const pagarme = new PagarMe({
    api_key: process.env.PAGARME_API_KEY_LIVE // CHAVE DE PRODUÇÃO!
  });

  it('should create real PIX payment', async () => {
    // ⚠️ PERIGO: Cria transação real de R$ 100,00
    const transaction = await pagarme.transactions.create({
      amount: 10000, // R$ 100,00 SERÁ COBRADO!
      payment_method: 'pix',
      customer: {
        name: 'Cliente Real',
        email: 'cliente@empresareal.com', // EMAIL REAL!
        document_number: '12345678901'
      }
    });

    expect(transaction.status).toBe('waiting_payment');
    // ✅ Teste passa, mas:
    // - R$ 100,00 foram cobrados
    // - Cliente real recebeu email
    // - Transação está no dashboard
    // - Webhook foi enviado para produção
  });

  it('should handle payment failure', async () => {
    // ⚠️ PERIGO: Tentativa com cartão inválido
    const transaction = await pagarme.transactions.create({
      amount: 5000,
      payment_method: 'credit_card',
      card_number: '4111111111111111', // Cartão de teste, mas...
      card_holder_name: 'TESTE',
      card_expiration_date: '1225',
      card_cvv: '123'
    });

    // Mesmo sendo cartão de teste, pode gerar:
    // - Logs de tentativa
    // - Alertas de segurança
    // - Métricas incorretas
  });
});

// 🏃‍♂️ RESULTADO APÓS 100 EXECUÇÕES:
// - R$ 10.000,00 em transações reais
// - 100 emails enviados para clientes
// - Dashboard poluído com testes
// - Métricas de produção corrompidas
// - Possível bloqueio por atividade suspeita
```

## ✅ EXEMPLO DE TESTE SEGURO (FAZER):

```typescript
// ✅ TESTE SEGURO - USA MOCKS
import { mockPagarMe } from '../mocks/pagarme';

describe('PIX Payment - MOCK SEGURO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create PIX payment', async () => {
    // ✅ SEGURO: Mock retorna dados falsos
    mockPagarMe.transactions.create.mockResolvedValue({
      id: 'mock_transaction_123',
      status: 'waiting_payment',
      amount: 10000,
      pix_qr_code: 'mock_qr_code_data',
      pix_expiration_date: '2025-08-16T10:00:00Z'
    });

    const transaction = await createPixPayment({
      amount: 10000,
      customer: { email: 'test@test.com' }
    });

    expect(transaction.status).toBe('waiting_payment');
    // ✅ Teste passa e:
    // - R$ 0,00 cobrados
    // - Nenhum email enviado
    // - Dashboard limpo
    // - Execução instantânea
  });

  it('should handle API errors', async () => {
    // ✅ SEGURO: Simula erro sem causar problemas reais
    mockPagarMe.transactions.create.mockRejectedValue(
      new Error('Invalid API key')
    );

    await expect(
      createPixPayment({ amount: 5000 })
    ).rejects.toThrow('Invalid API key');

    // ✅ Testamos tratamento de erro sem:
    // - Causar erro real na API
    // - Alertar sistemas de monitoramento
    // - Gastar requests do plano
  });
});
```

## 💡 CENÁRIOS ONDE API REAL SERIA ACEITÁVEL:

### 1. **Testes de Integração Controlados**
```typescript
// ✅ Ambiente específico para testes
describe('Integration Tests', () => {
  // Apenas em ambiente de staging
  // Com chaves de sandbox
  // Executados manualmente
  // Com dados controlados
});
```

### 2. **Testes E2E Raros**
```typescript
// ✅ Poucos testes críticos
describe('E2E Critical Flow', () => {
  // Apenas 2-3 testes mais importantes
  // Executados apenas em releases
  // Com dados específicos de teste
  // Ambiente sandbox da Pagar.me
});
```

## 🔧 MELHOR PRÁTICA: AMBIENTE HÍBRIDO

```typescript
// config/test-environment.ts
export const getPaymentService = () => {
  if (process.env.NODE_ENV === 'e2e-staging') {
    // Sandbox da Pagar.me para testes E2E
    return new PagarMe({
      api_key: process.env.PAGARME_SANDBOX_KEY,
      environment: 'sandbox'
    });
  }
  
  // Mock para testes unitários/integração
  return mockPagarMe;
};
```

## 📊 RESUMO DOS CUSTOS:

| Tipo de Teste | Execuções/Dia | Custo/Execução | Custo/Mês |
|---------------|---------------|----------------|-----------|
| **API Real**  | 1000          | R$ 2,00        | R$ 60.000 |
| **Mock**      | 10000         | R$ 0,00        | R$ 0,00   |
| **Sandbox**   | 50            | R$ 0,00        | R$ 0,00   |

## ⚡ CONCLUSÃO:

- ❌ **API Real nos testes** = Desastre financeiro
- ✅ **Mocks para 95%** = Rápido, grátis, seguro
- ✅ **Sandbox para 5%** = Validação real sem custo
