# Logs de Debug - Fluxo do Desconto de Cupom

## Objetivo
Rastrear o fluxo completo do desconto de cupom desde quando é aplicado na página `/checkout` até chegar ao `FinishOrder` na página `/checkout/payment`.

## Logs Adicionados

### 1. ResumeTable.tsx
#### Quando cupom muda:
```
🎫 [RESUME TABLE] Cupom mudou, triggering recálculo
```
- Mostra: discountValue, appliedCoupon, location, hasDiscountValue, hasAppliedCoupon

#### Antes do calculateTotal:
```
🧮 [RESUME TABLE] === ANTES DO CALCULATETOTAL ===
```
- Mostra: todos os arrays de valores, discountValue, couponId, location

#### Depois do calculateTotal:
```
🧮 [RESUME TABLE] === DEPOIS DO CALCULATETOTAL ===
```
- Confirma que calculateTotal foi chamado com desconto

### 2. calculateTotal.ts
#### Entrada da função:
```
🧮 [CALCULATE TOTAL] === FUNÇÃO CHAMADA ===
```
- Mostra: discountValue, couponId, todos os arrays, hasDiscount, hasCouponId

#### Salvando totais:
```
📊 [CALCULATE TOTAL] === SALVANDO TOTAIS ===
```
- Mostra: userId, valores calculados, discountValue, couponId

#### Dados para salvar:
```
💾 [SAVE ORDER TOTALS] === DADOS PARA SALVAR ===
```
- Mostra: finalPriceWithDiscount, originalTotal, recordData, calculoCorreto

#### Sucesso ao salvar:
```
✅ [ORDER TOTALS WITH DISCOUNT] === TOTAIS SALVOS COM SUCESSO ===
```
- Confirma que dados foram salvos no banco com recordId

### 3. Payment.tsx
#### Carregando totais:
```
🔍 [PAYMENT] === CARREGANDO ORDER TOTALS ===
```
- Mostra: timestamp, location, action

#### Dados do banco:
```
📊 [PAYMENT] === DADOS RETORNADOS DO BANCO ===
```
- Mostra: data retornado do Supabase

#### Totais carregados:
```
🔍 [PAYMENT] === ORDER TOTALS LOADED ===
```
- Mostra: todos os valores parseados, hasDiscount, hasCouponId, totalAmountCents

### 4. FinishOrder.tsx
#### Buscando totais:
```
🔍 [FINISH ORDER] === FETCHANDO TOTAIS ===
```
- Mostra: timestamp, location, refreshKey

#### Dados retornados:
```
📊 [FINISH ORDER] === DADOS RETORNADOS ===
```
- Mostra: orderTotals, hasData

#### Valores aplicados:
```
✅ [FINISH ORDER] === VALORES APLICADOS ===
```
- Mostra: todos os valores parseados, hasDiscount, hasCouponId

#### Renderização desconto:
```
💰 [FINISH ORDER] === RENDERIZAÇÃO DESCONTO ===
```
- Mostra: isPaymentPage, dbDiscountValue, discountValue, showingDiscount

#### Total final:
```
💰 [FINISH ORDER] === TOTAL FINAL RENDERIZADO ===
```
- Mostra: valores finais usados na renderização

### 5. useCouponDiscount.ts
#### Cupom aplicado:
```
✅ [CUPOM] === APLICADO COM SUCESSO ===
```
- Mostra: coupon, discount, orderTotal, contextUpdated, couponId

#### Cupom inválido:
```
❌ [CUPOM] === INVÁLIDO ===
```
- Mostra: error, couponCode, orderTotal

## Fluxo Esperado de Logs

### Na página /checkout (aplicando cupom):
1. `✅ [CUPOM] === APLICADO COM SUCESSO ===`
2. `🎫 [RESUME TABLE] Cupom mudou, triggering recálculo`
3. `🧮 [RESUME TABLE] === ANTES DO CALCULATETOTAL ===`
4. `🧮 [CALCULATE TOTAL] === FUNÇÃO CHAMADA ===`
5. `📊 [CALCULATE TOTAL] === SALVANDO TOTAIS ===`
6. `💾 [SAVE ORDER TOTALS] === DADOS PARA SALVAR ===`
7. `✅ [ORDER TOTALS WITH DISCOUNT] === TOTAIS SALVOS COM SUCESSO ===`

### Na página /checkout/payment (carregando dados):
1. `🔍 [PAYMENT] === CARREGANDO ORDER TOTALS ===`
2. `📊 [PAYMENT] === DADOS RETORNADOS DO BANCO ===`
3. `🔍 [PAYMENT] === ORDER TOTALS LOADED ===`
4. `🔍 [FINISH ORDER] === FETCHANDO TOTAIS ===`
5. `📊 [FINISH ORDER] === DADOS RETORNADOS ===`
6. `✅ [FINISH ORDER] === VALORES APLICADOS ===`
7. `💰 [FINISH ORDER] === RENDERIZAÇÃO DESCONTO ===`
8. `💰 [FINISH ORDER] === TOTAL FINAL RENDERIZADO ===`

## Como Usar os Logs

1. **Abra o Console do navegador** (F12 > Console)
2. **Aplique um cupom** na página `/checkout`
3. **Verifique os logs** da primeira parte do fluxo
4. **Navegue para** `/checkout/payment`
5. **Verifique os logs** da segunda parte do fluxo

## Diagnóstico

### Se o desconto não aparecer:
- ❌ **Problema no contexto**: Logs `✅ [CUPOM]` não aparecem
- ❌ **Problema no cálculo**: Logs `🧮 [CALCULATE TOTAL]` mostram discountValue = 0
- ❌ **Problema no banco**: Logs `💾 [SAVE ORDER TOTALS]` mostram erro
- ❌ **Problema no carregamento**: Logs `🔍 [PAYMENT]` mostram discount_value = 0
- ❌ **Problema na renderização**: Logs `💰 [FINISH ORDER]` mostram valores incorretos

### Pontos de verificação:
1. **discountValue > 0** em todos os logs
2. **hasCouponId = true** quando cupom aplicado
3. **hasDiscount = true** quando esperado
4. **finalPriceWithDiscount < originalTotal** quando há desconto
5. **showingDiscount = true** na renderização

## Arquivos Modificados
- ✅ `src/components/Checkout/ResumeTable.tsx`
- ✅ `src/components/Checkout/utils/calculateTotal.ts`
- ✅ `src/pages/Checkout/Payment.tsx`
- ✅ `src/components/Checkout/FinishOrder.tsx`
- ✅ `src/components/Checkout/utils/coupon/useCouponDiscount.ts`
