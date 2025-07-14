# Análise do Fluxo de Dados - Campo Telefone vs Outros Campos

## 🔍 DIFERENÇAS ENCONTRADAS NO FLUXO:

### 1. **No MaskedInput.tsx (linha ~224)**
```typescript
// TODOS OS CAMPOS (exceto email):
const syntheticEvent = {
  ...e,
  target: {
    ...e.target,
    value: mask === "email" ? formattedValue : removeMask(formattedValue),
  },
};
```

**PROBLEMA**: 
- Email → mantém o valor formatado
- Telefone, CEP, CPF, CNPJ → remove a máscara com `removeMask()`

### 2. **No PaymentInformationForm.tsx (linhas 55-57)**
```typescript
// Para campos que vêm do MaskedInput, o valor já está limpo (sem máscara)
// Exceto para telefone que precisa de validação especial
const zipCodeClean = cleanValue(formData.zipCode);        // ❌ DUPLA LIMPEZA
const documentClean = cleanValue(formData.documentNumber); // ❌ DUPLA LIMPEZA
const phoneClean = formData.phone ? formData.phone.replace(/\D/g, "") : ""; // ✅ LIMPEZA DIRETA
```

**INCONSISTÊNCIA DESCOBERTA**:
- Telefone: limpeza direta com `replace(/\D/g, "")`
- Outros campos: limpeza com `cleanValue()` que também faz `replace(/\D/g, "")`
- Mas TODOS os campos já chegam limpos do `MaskedInput`!

### 3. **cleanValue() é redundante para todos os campos**
```typescript
const cleanValue = (value: string): string => {
  return value?.replace(/\D/g, "") || "";
};
```

## 📊 FLUXO ATUAL:

### Campo CEP:
1. User digita: "12345678"
2. MaskedInput formata: "12345-678" 
3. MaskedInput envia via onChange: "12345678" (sem máscara)
4. PaymentInformationForm recebe: "12345678"
5. Na validação aplica cleanValue(): "12345678" (redundante)

### Campo Telefone:
1. User digita: "11987654321"
2. MaskedInput formata: "(11) 98765-4321"
3. MaskedInput envia via onChange: "11987654321" (sem máscara)
4. PaymentInformationForm recebe: "11987654321"
5. Na validação aplica replace(): "11987654321" (redundante, mas mesmo resultado)

## ❌ PROBLEMA REAL:
**TODOS OS CAMPOS FAZEM LIMPEZA DUPLA DESNECESSÁRIA!**

O MaskedInput já remove a máscara antes de enviar o valor, então aplicar `cleanValue()` ou `replace()` novamente na validação é redundante.
