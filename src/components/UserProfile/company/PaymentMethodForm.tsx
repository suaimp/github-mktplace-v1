import { useEffect } from "react";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";

interface CompanyData {
  withdrawal_method?: "bank" | "paypal" | "pix" | "other";
  bank_transfer_type?: "domestic" | "international";
  pix_key_type?: "cpf" | "cnpj" | "phone" | "email" | "random";
  pix_key?: string;
  bank_code?: string;
  bank_agency?: string;
  bank_account_number?: string;
  bank_account_type?: string;
  bank_account_holder?: string;
  bank_account_holder_document?: string;
  bank_swift?: string;
  bank_iban?: string;
  bank_routing_number?: string;
  bank_address?: string;
  bank_country?: string;
  paypal_id?: string;
  other_payment_info?: string;
}

interface PaymentMethodFormProps {
  data: CompanyData;
  onChange: (data: CompanyData) => void;
}

export default function PaymentMethodForm({
  data,
  onChange
}: PaymentMethodFormProps) {
  const handleChange = (field: keyof CompanyData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const clearBankFields = () => {
    const clearedData = { ...data };
    delete clearedData.bank_transfer_type;
    delete clearedData.bank_code;
    delete clearedData.bank_agency;
    delete clearedData.bank_account_number;
    delete clearedData.bank_account_type;
    delete clearedData.bank_account_holder;
    delete clearedData.bank_account_holder_document;
    delete clearedData.bank_swift;
    delete clearedData.bank_iban;
    delete clearedData.bank_routing_number;
    delete clearedData.bank_address;
    delete clearedData.bank_country;
    onChange(clearedData);
  };

  const clearPixFields = () => {
    const clearedData = { ...data };
    delete clearedData.pix_key_type;
    delete clearedData.pix_key;
    onChange(clearedData);
  };

  const clearPayPalFields = () => {
    const clearedData = { ...data };
    delete clearedData.paypal_id;
    onChange(clearedData);
  };

  const clearOtherFields = () => {
    const clearedData = { ...data };
    delete clearedData.other_payment_info;
    onChange(clearedData);
  };

  useEffect(() => {
    // Clear fields when withdrawal method changes
    switch (data.withdrawal_method) {
      case "bank":
        clearPixFields();
        clearPayPalFields();
        clearOtherFields();
        break;
      case "pix":
        clearBankFields();
        clearPayPalFields();
        clearOtherFields();
        break;
      case "paypal":
        clearBankFields();
        clearPixFields();
        clearOtherFields();
        break;
      case "other":
        clearBankFields();
        clearPixFields();
        clearPayPalFields();
        break;
      default:
        clearBankFields();
        clearPixFields();
        clearPayPalFields();
        clearOtherFields();
    }
  }, [data.withdrawal_method]);

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Método de Retirada de Fundos
      </h4>

      <div>
        <Label>Método de Pagamento</Label>
        <Select
          options={[
            { value: "bank", label: "Transferência Bancária" },
            { value: "pix", label: "PIX" },
            { value: "paypal", label: "PayPal" },
            { value: "other", label: "Outro" }
          ]}
          value={data.withdrawal_method || ""}
          onChange={(value) => handleChange("withdrawal_method", value)}
        />
      </div>

      {data.withdrawal_method === "bank" && (
        <div className="space-y-6">
          <div>
            <Label>Tipo de Transferência</Label>
            <Select
              options={[
                { value: "domestic", label: "Nacional" },
                { value: "international", label: "Internacional" }
              ]}
              value={data.bank_transfer_type || ""}
              onChange={(value) => handleChange("bank_transfer_type", value)}
            />
          </div>

          {data.bank_transfer_type === "domestic" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label>Código do Banco</Label>
                <Input
                  type="text"
                  value={data.bank_code || ""}
                  onChange={(e) => handleChange("bank_code", e.target.value)}
                />
              </div>

              <div>
                <Label>Agência</Label>
                <Input
                  type="text"
                  value={data.bank_agency || ""}
                  onChange={(e) => handleChange("bank_agency", e.target.value)}
                />
              </div>

              <div>
                <Label>Número da Conta</Label>
                <Input
                  type="text"
                  value={data.bank_account_number || ""}
                  onChange={(e) =>
                    handleChange("bank_account_number", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Tipo de Conta</Label>
                <Input
                  type="text"
                  value={data.bank_account_type || ""}
                  onChange={(e) =>
                    handleChange("bank_account_type", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Nome do Titular</Label>
                <Input
                  type="text"
                  value={data.bank_account_holder || ""}
                  onChange={(e) =>
                    handleChange("bank_account_holder", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>CPF/CNPJ do Titular</Label>
                <Input
                  type="text"
                  value={data.bank_account_holder_document || ""}
                  onChange={(e) =>
                    handleChange("bank_account_holder_document", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {data.bank_transfer_type === "international" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label>Código SWIFT/BIC</Label>
                <Input
                  type="text"
                  value={data.bank_swift || ""}
                  onChange={(e) => handleChange("bank_swift", e.target.value)}
                />
              </div>

              <div>
                <Label>IBAN</Label>
                <Input
                  type="text"
                  value={data.bank_iban || ""}
                  onChange={(e) => handleChange("bank_iban", e.target.value)}
                />
              </div>

              <div>
                <Label>Routing Number</Label>
                <Input
                  type="text"
                  value={data.bank_routing_number || ""}
                  onChange={(e) =>
                    handleChange("bank_routing_number", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>País do Banco</Label>
                <Input
                  type="text"
                  value={data.bank_country || ""}
                  onChange={(e) => handleChange("bank_country", e.target.value)}
                />
              </div>

              <div className="lg:col-span-2">
                <Label>Endereço do Banco</Label>
                <Input
                  type="text"
                  value={data.bank_address || ""}
                  onChange={(e) => handleChange("bank_address", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {data.withdrawal_method === "pix" && (
        <div className="space-y-6">
          <div>
            <Label>Tipo de Chave PIX</Label>
            <Select
              options={[
                { value: "cpf", label: "CPF" },
                { value: "cnpj", label: "CNPJ" },
                { value: "phone", label: "Telefone" },
                { value: "email", label: "Email" },
                { value: "random", label: "Chave Aleatória" }
              ]}
              value={data.pix_key_type || ""}
              onChange={(value) => handleChange("pix_key_type", value)}
            />
          </div>

          <div>
            <Label>Chave PIX</Label>
            <Input
              type="text"
              value={data.pix_key || ""}
              onChange={(e) => handleChange("pix_key", e.target.value)}
            />
          </div>
        </div>
      )}

      {data.withdrawal_method === "paypal" && (
        <div>
          <Label>ID do PayPal</Label>
          <Input
            type="text"
            value={data.paypal_id || ""}
            onChange={(e) => handleChange("paypal_id", e.target.value)}
          />
        </div>
      )}

      {data.withdrawal_method === "other" && (
        <div>
          <Label>Informações de Pagamento</Label>
          <Input
            type="text"
            value={data.other_payment_info || ""}
            onChange={(e) => handleChange("other_payment_info", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
