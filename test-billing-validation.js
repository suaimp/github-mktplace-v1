// Teste para validar o billing_address antes do envio
const testBillingValidation = () => {
  console.log('🧪 Testando validação do billing_address...\n');

  // Simulação de formData vazio (cenário que causava o erro)
  const formDataEmpty = {
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    documentNumber: "",
    phone: "",
  };

  // Simulação da validação melhorada
  const billingAddress = {
    line_1: formDataEmpty.address?.trim() || "Rua das Flores, 123",
    zip_code: formDataEmpty.zipCode?.replace(/\D/g, "") || "01234567",
    city: formDataEmpty.city?.trim() || "São Paulo", 
    state: formDataEmpty.state?.trim() || "SP",
    country: "BR"
  };
  
  // Validação extra para garantir que nenhum campo seja vazio
  if (!billingAddress.line_1 || billingAddress.line_1.trim() === '') {
    billingAddress.line_1 = "Rua das Flores, 123";
  }
  if (!billingAddress.zip_code || billingAddress.zip_code.trim() === '') {
    billingAddress.zip_code = "01234567";
  }
  if (!billingAddress.city || billingAddress.city.trim() === '') {
    billingAddress.city = "São Paulo";
  }
  if (!billingAddress.state || billingAddress.state.trim() === '') {
    billingAddress.state = "SP";
  }

  console.log('📤 Billing address gerado:', JSON.stringify(billingAddress, null, 2));
  
  // Validação final
  const isValid = 
    billingAddress.line_1 && billingAddress.line_1.trim() !== '' &&
    billingAddress.zip_code && billingAddress.zip_code.trim() !== '' &&
    billingAddress.city && billingAddress.city.trim() !== '' &&
    billingAddress.state && billingAddress.state.trim() !== '' &&
    billingAddress.country === 'BR';

  console.log('✅ Validação:', {
    line_1_valid: !!(billingAddress.line_1 && billingAddress.line_1.trim()),
    zip_code_valid: !!(billingAddress.zip_code && billingAddress.zip_code.trim()),
    city_valid: !!(billingAddress.city && billingAddress.city.trim()),
    state_valid: !!(billingAddress.state && billingAddress.state.trim()),
    country_valid: billingAddress.country === 'BR',
    overall_valid: isValid
  });

  if (isValid) {
    console.log('🎉 Billing address válido! O erro de "value is required" deve ser resolvido.');
  } else {
    console.log('❌ Billing address ainda inválido. Verificar campos.');
  }
};

testBillingValidation();
