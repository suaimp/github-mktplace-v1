## 🔧 CORREÇÃO DO ERRO CNPJ/CPF NO PIX

### ❌ **PROBLEMA IDENTIFICADO:**
Na rota `/payment`, quando um cliente empresa (CNPJ) tentava gerar o QR Code PIX, estava aparecendo o erro "CPF inválido" porque:

1. **Payment.tsx**: Não enviava o `legal_status` para a função PIX
2. **pagarme-pix-payment/index.ts**: Tinha `document_type: "cpf"` hardcoded
3. **pagarme-pix-payment/index.ts**: Validava sempre como CPF (11 dígitos) mesmo para CNPJ (14 dígitos)

### ✅ **CORREÇÕES IMPLEMENTADAS:**

#### 1. **Payment.tsx - Linha ~618:**
```tsx
// ANTES
body: JSON.stringify({
  amount: Math.round(total * 100),
  customer_name: formData.name,
  customer_email: formData.email,
  customer_document: formData.documentNumber.replace(/\D/g, ""),
  customer_phone: formData.phone.replace(/\D/g, ""),
  order_id: orderId,
  // ...
})

// DEPOIS
body: JSON.stringify({
  amount: Math.round(total * 100),
  customer_name: formData.name,
  customer_email: formData.email,
  customer_document: formData.documentNumber.replace(/\D/g, ""),
  customer_phone: formData.phone.replace(/\D/g, ""),
  customer_legal_status: formData.legal_status, // ✅ NOVO
  customer_company_name: formData.company_name, // ✅ NOVO
  order_id: orderId,
  // ...
})
```

#### 2. **pagarme-pix-payment/index.ts - Linha ~121:**
```typescript
// ANTES
const { amount, customer_name, customer_email, customer_document, customer_phone, order_items } = body;

// DEPOIS
const { 
  amount, 
  customer_name, 
  customer_email, 
  customer_document, 
  customer_phone, 
  customer_legal_status,     // ✅ NOVO
  customer_company_name,     // ✅ NOVO
  order_items 
} = body;

// ✅ NOVO: Determinar tipo baseado no legal_status
const isBusinessCustomer = customer_legal_status === "business";
const document_type = isBusinessCustomer ? "cnpj" : "cpf";
const customer_type = isBusinessCustomer ? "company" : "individual";
const documentTypeName = isBusinessCustomer ? "CNPJ" : "CPF";
const expectedDocumentLength = isBusinessCustomer ? 14 : 11;
```

#### 3. **pagarme-pix-payment/index.ts - Validação de Documento:**
```typescript
// ANTES (linha ~196)
let documentClean = customer_document.replace(/\D/g, "");
if (documentClean.length !== 11) {
  return new Response(JSON.stringify({
    error: 'CPF inválido', // ❌ Sempre CPF
    debug: `CPF deve ter 11 dígitos. Recebido: ${customer_document} -> ${documentClean} (${documentClean.length} dígitos)`
  }), { status: 400, headers: corsHeaders });
}

// DEPOIS
let documentClean = customer_document.replace(/\D/g, "");
if (documentClean.length !== expectedDocumentLength) {
  return new Response(JSON.stringify({
    error: `${documentTypeName} inválido`, // ✅ CPF ou CNPJ dinâmico
    debug: `${documentTypeName} deve ter ${expectedDocumentLength} dígitos. Recebido: ${customer_document} -> ${documentClean} (${documentClean.length} dígitos)`,
    legal_status: customer_legal_status,
    expected_document_type: document_type
  }), { status: 400, headers: corsHeaders });
}
```

#### 4. **pagarme-pix-payment/index.ts - Payload para Pagar.me:**
```typescript
// ANTES (linha ~268)
customer: {
  name: customer_name,
  email: customer_email,
  document: documentClean,
  document_type: "cpf",        // ❌ Hardcoded
  type: "individual",          // ❌ Hardcoded
  // ...
}

// DEPOIS
customer: {
  name: customer_display_name,   // ✅ Company name se for business
  email: customer_email,
  document: documentClean,
  document_type: document_type,  // ✅ "cpf" ou "cnpj" baseado no legal_status
  type: customer_type,          // ✅ "individual" ou "company" baseado no legal_status
  // ...
}
```

### 🧪 **TESTE DA CORREÇÃO:**

Executado `test-cnpj-pix-fix.js` que confirma:
- ✅ `legal_status: "individual"` → `document_type: "cpf"`, `type: "individual"`
- ✅ `legal_status: "business"` → `document_type: "cnpj"`, `type: "company"`

### 📋 **RESULTADO ESPERADO:**

Agora quando um cliente empresa (CNPJ) tentar gerar o QR Code PIX:
1. ✅ O `legal_status: "business"` será enviado no payload
2. ✅ A função determinará `document_type: "cnpj"` automaticamente
3. ✅ A validação aceitará 14 dígitos (CNPJ) em vez de 11 (CPF)
4. ✅ O payload para Pagar.me terá `document_type: "cnpj"` e `type: "company"`
5. ✅ O erro "CPF inválido" não aparecerá mais para CNPJ

### 🚀 **PRÓXIMO PASSO:**
Testar a rota `/payment` com um CNPJ válido para confirmar que o erro foi resolvido.
