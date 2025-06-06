import { useState, useEffect } from "react";
import Input from "../form/input/InputField";
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
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export default function PaymentInformationForm({
  formData,
  onChange
}: PaymentInformationFormProps) {
  const [loading, setLoading] = useState(true);

  const [accountType, setAccountType] = useState<"individual" | "business">(
    "individual"
  );

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
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setLoading(true);
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      // First check if user is admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, email, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      if (adminData) {
        // Get company data for admin
        const { data } = await supabase
          .from("company_data")
          .select("*")
          .eq("admin_id", user.id)
          .maybeSingle();

        if (data) {
          setAccountType(data.legal_status || "individual");

          // Update form data based on account type
          const event = {
            target: {
              name: "name",
              value:
                data.legal_status === "business"
                  ? data.company_name || ""
                  : `${adminData.first_name} ${adminData.last_name}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(event);

          // Update email
          onChange({
            target: { name: "email", value: adminData.email }
          } as React.ChangeEvent<HTMLInputElement>);

          // Update address
          onChange({
            target: { name: "address", value: data.address || "" }
          } as React.ChangeEvent<HTMLInputElement>);

          // Update city
          onChange({
            target: { name: "city", value: data.city || "" }
          } as React.ChangeEvent<HTMLInputElement>);

          // Update state
          onChange({
            target: { name: "state", value: data.state || "" }
          } as React.ChangeEvent<HTMLInputElement>);

          // Update zipCode
          onChange({
            target: { name: "zipCode", value: data.zip_code || "" }
          } as React.ChangeEvent<HTMLInputElement>);

          // Update documentNumber
          onChange({
            target: {
              name: "documentNumber",
              value: data.document_number || ""
            }
          } as React.ChangeEvent<HTMLInputElement>);
        }
      } else {
        // Get user data for platform user
        const { data: platformUserData } = await supabase
          .from("platform_users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (platformUserData) {
          // Get company data for platform user
          const { data } = await supabase
            .from("company_data")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data) {
            setAccountType(data.legal_status || "individual");

            // Update form data based on account type
            const event = {
              target: {
                name: "name",
                value:
                  data.legal_status === "business"
                    ? data.company_name || ""
                    : `${platformUserData.first_name} ${platformUserData.last_name}`
              }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);

            // Update email
            onChange({
              target: { name: "email", value: platformUserData.email }
            } as React.ChangeEvent<HTMLInputElement>);

            // Update address
            onChange({
              target: { name: "address", value: data.address || "" }
            } as React.ChangeEvent<HTMLInputElement>);

            // Update city
            onChange({
              target: { name: "city", value: data.city || "" }
            } as React.ChangeEvent<HTMLInputElement>);

            // Update state
            onChange({
              target: { name: "state", value: data.state || "" }
            } as React.ChangeEvent<HTMLInputElement>);

            // Update zipCode
            onChange({
              target: { name: "zipCode", value: data.zip_code || "" }
            } as React.ChangeEvent<HTMLInputElement>);

            // Update documentNumber
            onChange({
              target: {
                name: "documentNumber",
                value: data.document_number || ""
              }
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            // No company data, just use platform user data
            onChange({
              target: {
                name: "name",
                value: `${platformUserData.first_name} ${platformUserData.last_name}`
              }
            } as React.ChangeEvent<HTMLInputElement>);

            onChange({
              target: { name: "email", value: platformUserData.email }
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
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
          <Input
            type="email"
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
          <Input
            type="text"
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
          <Input
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={onChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
