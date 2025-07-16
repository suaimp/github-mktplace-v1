import { useState, useEffect, memo } from "react";
import Input from "../form/input/InputField";
import MaskedInput from "../form/input/MaskedInput";
import Label from "../form/Label";
import Select from "../form/Select";
import { supabase } from "../../lib/supabase";
import { CountryStates } from "../UserProfile/company/CountryStates";
import { validateCNPJ, validateCPF } from "../../utils/inputMasks";
 

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
    legal_status: "individual" | "business";
    country: string;
    company_name?: string;
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
  console.log('[DEBUG PaymentInformationForm] legal_status:', formData.legal_status, '| documentNumber:', formData.documentNumber);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Proteção contra múltiplas execuções

  const [legalStatus, setLegalStatus] = useState<'business' | 'individual'>(formData.legal_status || 'individual');
  const [country, setCountry] = useState(formData.country || 'BR');
  const stateOptions = CountryStates[country] || [];

  // Atualiza legalStatus/country no formData e local
  const handleLegalStatusChange = (value: string) => {
    setLegalStatus(value as 'business' | 'individual');
    // Criar evento sintético compatível com handleInputChange do pai
    const syntheticEvent = {
      target: {
        name: 'legal_status',
        value: value as 'business' | 'individual',
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };
  const handleCountryChange = (value: string) => {
    setCountry(value);
    onChange({ target: { name: 'country', value } } as React.ChangeEvent<HTMLInputElement>);
    // Limpa estado se país mudar
    onChange({ target: { name: 'state', value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

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
    const zipCodeClean = cleanValue(formData.zipCode);
    const documentClean = cleanValue(formData.documentNumber);
    const phoneClean = cleanValue(formData.phone);
    const zipCodeValid = !!zipCodeClean && zipCodeClean.length >= 5; // Aceita CEP ou código internacional
    const phoneValid = !!phoneClean && phoneClean.length >= 10 && phoneClean.length <= 13;

    let documentValid = false;
    let companyNameValid = true;
    if (formData.legal_status === "business") {
      console.log("[VALIDAÇÃO DOCUMENTO] Usando validateCNPJ | legal_status:", formData.legal_status, "| valor:", formData.documentNumber);
      // LOG DE DEPURAÇÃO PARA DOCUMENTO CNPJ
      const rawDoc = formData.documentNumber;
      const cleanedDoc = rawDoc ? rawDoc.replace(/\D/g, "") : "";
      const validCNPJ = validateCNPJ(rawDoc);
      console.log("[DEBUG CNPJ] raw:", rawDoc, "| cleaned:", cleanedDoc, "| valid:", validCNPJ);
      // CNPJ obrigatório: exatamente 14 dígitos (usando função utilitária)
      documentValid = validCNPJ;
      companyNameValid = !!formData.company_name?.trim() && formData.company_name.trim().length >= 2;
    } else {
      console.log("[VALIDAÇÃO DOCUMENTO] Usando validateCPF | legal_status:", formData.legal_status, "| valor:", formData.documentNumber);
      documentValid = validateCPF(formData.documentNumber);
    }

    console.log("🔍 VALIDAÇÃO DETALHADA:", {
      name: { value: formData.name, valid: nameValid },
      email: { value: formData.email, valid: emailValid },
      address: { value: formData.address, valid: addressValid },
      city: { value: formData.city, valid: cityValid },
      state: { value: formData.state, valid: stateValid },
      zipCode: { value: formData.zipCode, cleaned: zipCodeClean, valid: zipCodeValid },
      document: { value: formData.documentNumber, cleaned: documentClean, valid: documentValid },
      phone: { value: formData.phone, cleaned: phoneClean, valid: phoneValid },
      company_name: { value: formData.company_name, valid: companyNameValid }
    });

    let isValid = nameValid && emailValid && addressValid && cityValid && stateValid && zipCodeValid && documentValid && phoneValid;
    if (formData.legal_status === "business") {
      isValid = isValid && companyNameValid;
    }

    console.log("✅ RESULTADO DA VALIDAÇÃO:", { isValid });
    return isValid;
  };

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
      // Só valida se todos os campos obrigatórios já têm valor preenchido
      const obrigatorios = [
        'name', 'email', 'address', 'city', 'state', 'zipCode', 'documentNumber', 'phone',
      ];
      if (formData.legal_status === 'business') obrigatorios.push('company_name');
      const allFilled = obrigatorios.every(
        (key) => formData[key] && formData[key].toString().trim() !== ""
      );
      if (!allFilled) return;
      const validationTimer = setTimeout(() => {
        const isValid = validatePaymentInfoForm();
        onValidSubmit(isValid);
      }, 300);
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
        .select("id, email, first_name, last_name, phone")
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

        // Busca o telefone do admin
        const adminPhone = adminData.phone || "";
        // Busca o nome completo do admin
        const adminFullName = `${adminData.first_name || ""} ${adminData.last_name || ""}`.trim();

        if (data) {
          setLegalStatus(data.legal_status || "individual");
          setCountry(data.country || "BR");
          // NOVO: Atualizar legal_status no formData também
          onChange({
            target: {
              name: 'legal_status',
              value: data.legal_status || 'individual',
            }
          } as React.ChangeEvent<HTMLInputElement>);
          const dataToUpdate = {
            name: adminFullName, // Sempre nome do usuário logado, nunca o nome da empresa
            email: adminData.email || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zip_code || "",
            documentNumber: data.document_number || "",
            phone: adminPhone,
            company_name: data.company_name || ""
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

        // Busca o telefone do usuário
        const userPhone = platformUserData?.phone || "";

        if (platformUserData) {
          // Get company data for platform user
          const { data } = await supabase
            .from("company_data")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          // Busca o nome completo do usuário
          const userFullName = `${platformUserData.first_name || ""} ${platformUserData.last_name || ""}`.trim();

          if (data) {
            setLegalStatus(data.legal_status || "individual");
            setCountry(data.country || "BR");
            // NOVO: Atualizar legal_status no formData também
            onChange({
              target: {
                name: 'legal_status',
                value: data.legal_status || 'individual',
              }
            } as React.ChangeEvent<HTMLInputElement>);
            const dataToUpdate = {
              name: userFullName, // Sempre nome do usuário logado, nunca o nome da empresa
              email: platformUserData.email || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              zipCode: data.zip_code || "",
              documentNumber: data.document_number || "",
              phone: userPhone,
              company_name: data.company_name || ""
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
      // Chama validação imediatamente após preenchimento automático
      setTimeout(() => {
        const isValid = validatePaymentInfoForm();
        onValidSubmit(isValid);
      }, 0);
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
          : legalStatus === "business"
          ? "Dados da Empresa"
          : "Dados Pessoais"}
      </p>

      {/* Linha: Nome Completo (ou Nome da Empresa para PF), Email */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Label>
            Nome Completo <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={onChange}
            required
            placeholder="Digite o nome completo"
            // Campo sempre habilitado
          />
        </div>
        <div>
          <Label>
            Email <span className="text-error-500">*</span>
          </Label>
          <Input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={onChange}
            required
            placeholder="Digite o email"
          />
        </div>
      </div>
      {/* Linha: Tipo de Pessoa, País */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        <div>
          <Label>
            Tipo de Pessoa <span className="text-error-500">*</span>
          </Label>
          <Select
            options={[
              { value: "individual", label: "Pessoa Física" },
              { value: "business", label: "Pessoa Jurídica" }
            ]}
            value={legalStatus}
            onChange={handleLegalStatusChange}
          />
        </div>
        <div>
          <Label>
            País <span className="text-error-500">*</span>
          </Label>
          <Select
            options={Object.entries(CountryStates).map(([code]) => ({
              value: code,
              label: code,
              icon: undefined // Adapte para mostrar bandeira se quiser
            }))}
            value={country}
            onChange={handleCountryChange}
          />
        </div>
      </div>
      {/* Linha: Estado, Cidade */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        <div>
          <Label>
            Estado {stateOptions.length > 0 && <span className="text-error-500">*</span>}
          </Label>
          <Select
            options={stateOptions.length > 0 ? [{ value: "", label: "Selecione o estado" }, ...stateOptions] : [{ value: "", label: "Selecione o país primeiro" }]}
            value={formData.state || ""}
            onChange={(value) =>
              onChange({ target: { name: "state", value } } as React.ChangeEvent<HTMLInputElement>)
            }
            disabled={stateOptions.length === 0}
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
      </div>
      {/* Linha: Endereço, CEP */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
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
            {country === "BR" ? "CEP" : "Código Postal"}
            {country === "BR" && <span className="text-error-500">*</span>}
          </Label>
          <MaskedInput
            mask={country === "BR" ? "cep" : "none"}
            name="zipCode"
            value={formData.zipCode}
            onChange={onChange}
            required
          />
        </div>
      </div>
      {/* Linha: CNPJ/CPF, Nome da Empresa (apenas para PJ) */}
      {legalStatus === "business" && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            <div>
              <Label>
                CNPJ <span className="text-error-500">*</span>
              </Label>
              <MaskedInput
                mask="cnpj"
                name="documentNumber"
                value={formData.documentNumber || ""}
                onChange={onChange}
                required
                placeholder="Digite o CNPJ"
              />
            </div>
            <div>
              <Label>
                Nome da Empresa <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="company_name"
                value={formData.company_name || ""}
                onChange={onChange}
                required
                placeholder="Digite o nome da empresa"
              />
            </div>
          </div>
          {/* Linha: Telefone/Celular para PJ */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
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
          </div>
        </>
      )}
      {legalStatus === "individual" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
          <div>
            <Label>
              CPF <span className="text-error-500">*</span>
            </Label>
            <MaskedInput
              mask="cpf"
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
        </div>
      )}
    </div>
  );
}

export default memo(PaymentInformationForm);
