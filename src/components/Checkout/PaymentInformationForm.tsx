import { useState, useEffect, memo } from "react";
import Input from "../form/input/InputField";
import MaskedInput from "../form/input/MaskedInput";
import Label from "../form/Label";
import Select from "../form/Select";
import { supabase } from "../../lib/supabase";
 

interface PaymentInformationFormProps {
  formData: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    documentNumber: string;
    phone: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onValidSubmit: (isValid: boolean) => void;
}

function PaymentInformationForm({
  formData,
  onChange,
  onValidSubmit
}: PaymentInformationFormProps) {
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Proteção contra múltiplas execuções

  const [accountType, setAccountType] = useState<"individual" | "business">(
    "individual"
  );

 

  // Função para limpar valores com máscara para validação
  const cleanValue = (value: string): string => {
    // Para números (CPF, CNPJ, CEP, telefone), remove tudo que não é dígito
    // Para email e texto, mantém caracteres válidos
    return value?.replace(/\D/g, "") || "";
  };

 

  // Atualiza estado do número do cartão e valida
 

  // Função de validação do formulário
  const validatePaymentInfoForm = () => {
    console.log("🔍 VALIDANDO FORMULÁRIO DE INFORMAÇÕES DE PAGAMENTO");
    console.log("📋 ESTADO ATUAL DO FORMDATA:", formData);
    
    const nameValid = !!formData.name?.trim() && formData.name.trim().length >= 2;
    const emailValid = !!formData.email?.trim() && formData.email.includes("@") && formData.email.includes(".");
    const addressValid = !!formData.address?.trim() && formData.address.trim().length >= 5;
    const cityValid = !!formData.city?.trim() && formData.city.trim().length >= 2;
    const stateValid = !!formData.state?.trim() && formData.state.trim().length >= 2;
    
    // Para campos que vêm do MaskedInput, o valor já está limpo (sem máscara)
    const zipCodeClean = cleanValue(formData.zipCode);
    const documentClean = cleanValue(formData.documentNumber);
    const phoneClean = cleanValue(formData.phone);
    
    const zipCodeValid = !!zipCodeClean && zipCodeClean.length === 8;
    const documentValid = !!documentClean && documentClean.length >= 11;
    const phoneValid = !!phoneClean && (phoneClean.length === 10 || phoneClean.length === 11);

    console.log("🔍 VALIDAÇÃO DETALHADA:", {
      name: { value: formData.name, valid: nameValid },
      email: { value: formData.email, valid: emailValid },
      address: { value: formData.address, valid: addressValid },
      city: { value: formData.city, valid: cityValid },
      state: { value: formData.state, valid: stateValid },
      zipCode: { value: formData.zipCode, cleaned: zipCodeClean, valid: zipCodeValid },
      document: { value: formData.documentNumber, cleaned: documentClean, valid: documentValid },
      phone: { value: formData.phone, cleaned: phoneClean, valid: phoneValid }
    });

    const isValid = nameValid && emailValid && addressValid && cityValid && stateValid && zipCodeValid && documentValid && phoneValid;
    
    console.log("✅ RESULTADO DA VALIDAÇÃO:", { isValid });

    return isValid;
  };

  const brazilianStates = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" }
  ];

  useEffect(() => {
    // Carregar dados do usuário apenas uma vez no início, antes do usuário interagir
    // ADICIONADO timeout para garantir que o componente pai inicializou completamente
    const timer = setTimeout(() => {
      loadUserData();
    }, 100); // 100ms de delay para garantir sincronização
    
    return () => clearTimeout(timer);
  }, []); // Array vazio = executa apenas uma vez no mount

  // Garantir sincronização de valores digitados (correção para race condition)
  useEffect(() => {
    // Após dados carregados, verificar se há campos com valor no display mas vazios no formData
    if (dataLoaded) {
      const fieldsToSync = ['phone', 'zipCode', 'documentNumber'];
      fieldsToSync.forEach(fieldName => {
        const currentValue = formData[fieldName as keyof typeof formData];
        if (!currentValue || currentValue.trim() === "") {
          // Campo está vazio no formData, mas pode ter valor no input
          console.log(`🔄 Verificando sincronização para ${fieldName}:`, currentValue);
        }
      });
    }
  }, [dataLoaded, formData]);

  // Debug effect para mostrar o valor atual do telefone
  useEffect(() => {
    console.log("📞 PHONE VALUE CHANGED:", {
      phoneValue: formData.phone,
      phoneType: typeof formData.phone,
      phoneLength: formData.phone?.length || 0,
      phoneClean: cleanValue(formData.phone),
      timestamp: new Date().toISOString()
    });
  }, [formData.phone]);

  // Effect para validação automática quando todos os campos estiverem preenchidos
  useEffect(() => {
    // Só executa se os dados já foram carregados (para evitar validar durante o loading inicial)
    if (dataLoaded && !loading) {
      // Pequeno delay para garantir que todas as mudanças foram aplicadas
      const validationTimer = setTimeout(() => {
        console.log("🔍 AUTO VALIDATION CHECK - Verificando se formulário está completo");
        
        const isValid = validatePaymentInfoForm();
        
        console.log("🎯 ENVIANDO RESULTADO DA VALIDAÇÃO PARA O COMPONENTE PAI:", {
          isValid: isValid,
          timestamp: new Date().toISOString()
        });
        
        onValidSubmit(isValid);
      }, 300); // 300ms de delay para aguardar sincronização completa
      
      return () => clearTimeout(validationTimer);
    }
  }, [formData, dataLoaded, loading]); // Executa sempre que formData mudar

  async function loadUserData() {
    try {
      setLoading(true);
      console.log("🔍 LOADING USER DATA - PaymentInformationForm");
      
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("❌ No user found");
        setDataLoaded(true);
        return;
      }

      console.log("👤 User found:", user.id);

      // First check if user is admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, email, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      console.log("🔍 Admin data:", adminData);

      if (adminData) {
        // Get company data for admin
        const { data } = await supabase
          .from("company_data")
          .select("*")
          .eq("admin_id", user.id)
          .maybeSingle();

        console.log("🏢 Company data for admin:", data);

        if (data) {
          setAccountType(data.legal_status || "individual");            const dataToUpdate = {
              name: data.legal_status === "business" ? data.company_name || "" : `${adminData.first_name} ${adminData.last_name}`,
              email: adminData.email || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              zipCode: data.zip_code || "",
              documentNumber: data.document_number || "",
              phone: (data.phone !== null && data.phone !== undefined) ? String(data.phone) : ""
            };

          console.log("📝 Data to update form (admin):", dataToUpdate);            // Update each field individually with detailed logs - APENAS CAMPOS VAZIOS
            Object.entries(dataToUpdate).forEach(([key, value]) => {
              console.log(`🔄 Updating ${key} with value:`, value);
              console.log(`🔄 Field "${key}" - Before onChange:`, formData[key as keyof typeof formData]);
              
              // PROTEÇÃO ABSOLUTA: Nunca sobrescrever valores não vazios
              const currentValue = formData[key as keyof typeof formData];
              if (currentValue && currentValue.toString().trim() !== "") {
                console.log(`🛡️ PROTEÇÃO: Campo ${key} já tem valor, não sobrescrever:`, currentValue);
                return;
              }
              
              // PROTEÇÃO ADICIONAL: Garantir que value nunca seja undefined ou null
              const safeValue = (value !== null && value !== undefined) ? String(value) : "";
              
              // Apenas preencher campos completamente vazios
              if (!currentValue || currentValue.toString().trim() === "") {
                console.log(`✅ Preenchendo ${key} com valor do banco:`, safeValue);
                onChange({
                  target: { name: key, value: safeValue }
                } as React.ChangeEvent<HTMLInputElement>);
              }
            });
        }
      } else {
        // Get user data for platform user
        const { data: platformUserData } = await supabase
          .from("platform_users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        console.log("👥 Platform user data:", platformUserData);

        if (platformUserData) {
          // Get company data for platform user
          const { data } = await supabase
            .from("company_data")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          console.log("🏢 Company data for platform user:", data);

          if (data) {
            setAccountType(data.legal_status || "individual");

            const dataToUpdate = {
              name: data.legal_status === "business" ? data.company_name || "" : `${platformUserData.first_name} ${platformUserData.last_name}`,
              email: platformUserData.email || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              zipCode: data.zip_code || "",
              documentNumber: data.document_number || "",
              phone: (data.phone !== null && data.phone !== undefined) ? String(data.phone) : ""
            };

            console.log("📝 Data to update form (platform user with company):", dataToUpdate);

            // Update each field individually with detailed logs - APENAS CAMPOS VAZIOS
            Object.entries(dataToUpdate).forEach(([key, value]) => {
              console.log(`🔄 Updating ${key} with value:`, value);
              console.log(`🔄 Field "${key}" - Before onChange:`, formData[key as keyof typeof formData]);
              
              // PROTEÇÃO ABSOLUTA: Nunca sobrescrever valores não vazios
              const currentValue = formData[key as keyof typeof formData];
              if (currentValue && currentValue.toString().trim() !== "") {
                console.log(`🛡️ PROTEÇÃO: Campo ${key} já tem valor, não sobrescrever:`, currentValue);
                return;
              }
              
              // PROTEÇÃO ADICIONAL: Garantir que value nunca seja undefined ou null
              const safeValue = (value !== null && value !== undefined) ? String(value) : "";
              
              // Apenas preencher campos completamente vazios
              if (!currentValue || currentValue.toString().trim() === "") {
                console.log(`✅ Preenchendo ${key} com valor do banco:`, safeValue);
                onChange({
                  target: { name: key, value: safeValue }
                } as React.ChangeEvent<HTMLInputElement>);
              }
            });
          } else {
            // No company data, just use platform user data
            const dataToUpdate = {
              name: `${platformUserData.first_name} ${platformUserData.last_name}`,
              email: platformUserData.email || "",
              address: "",
              city: "",
              state: "",
              zipCode: "",
              documentNumber: "",
              phone: ""
            };

            console.log("📝 Data to update form (platform user without company):", dataToUpdate);

            Object.entries(dataToUpdate).forEach(([key, value]) => {
              console.log(`🔄 Updating ${key} with value:`, value);
              console.log(`🔄 Field "${key}" - Before onChange:`, formData[key as keyof typeof formData]);
              
              // PROTEÇÃO ABSOLUTA: Nunca sobrescrever valores não vazios
              const currentValue = formData[key as keyof typeof formData];
              if (currentValue && currentValue.toString().trim() !== "") {
                console.log(`🛡️ PROTEÇÃO: Campo ${key} já tem valor, não sobrescrever:`, currentValue);
                return;
              }
              
              // PROTEÇÃO ADICIONAL: Garantir que value nunca seja undefined ou null
              const safeValue = (value !== null && value !== undefined) ? String(value) : "";
              
              // Apenas preencher campos completamente vazios
              if (!currentValue || currentValue.toString().trim() === "") {
                console.log(`✅ Preenchendo ${key} com valor do banco:`, safeValue);
                onChange({
                  target: { name: key, value: safeValue }
                } as React.ChangeEvent<HTMLInputElement>);
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ Error loading user data:", err);
    } finally {
      setLoading(false);
      setDataLoaded(true);
      console.log("✅ Loading user data completed");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center mb-4">
        <svg
          className="w-6 h-6 mr-2 text-gray-800 dark:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          Informações de pagamento
        </h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {loading
          ? "Carregando informações..."
          : accountType === "business"
          ? "Dados da Empresa"
          : "Dados Pessoais"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>
            {accountType === "business" ? "Nome da Empresa" : "Nome Completo"}{" "}
            <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label>
            Email <span className="text-error-500">*</span>
          </Label>
          <MaskedInput
            mask="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label>
            Endereço <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label>
            Cidade <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label>
            Estado <span className="text-error-500">*</span>
          </Label>
          <Select
            options={brazilianStates}
            value={formData.state}
            onChange={(value) =>
              onChange({
                target: { name: "state", value }
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            placeholder="Selecione um estado"
          />
        </div>
        <div>
          <Label>
            CEP <span className="text-error-500">*</span>
          </Label>
          <MaskedInput
            mask="cep"
            name="zipCode"
            value={formData.zipCode}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label>
            {accountType === "business" ? "CNPJ" : "CPF"}{" "}
            <span className="text-error-500">*</span>
          </Label>
          <MaskedInput
            mask={accountType === "business" ? "cnpj" : "cpf"}
            name="documentNumber"
            value={formData.documentNumber}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label>
            Telefone/Celular <span className="text-error-500">*</span>
          </Label>
          <MaskedInput
            mask="phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            required
          />
        </div>
        {/* Exemplo de campo de cartão de crédito */}
        {/* Removido campo de exemplo de número do cartão conforme solicitado */}
      </div>
    </div>
  );
}

export default memo(PaymentInformationForm);
