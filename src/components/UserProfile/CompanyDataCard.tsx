import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import CompanyInfoForm from "./company/CompanyInfoForm";
import PaymentMethodForm from "./company/PaymentMethodForm";
import { supabase } from "../../lib/supabase";

interface AdminProfile {
  id: string;
  email: string;
  phone?: string;
}

interface CompanyData {
  id?: string;
  legal_status: "business" | "individual";
  country: string;
  company_name?: string;
  city: string;
  zip_code: string;
  address: string;
  document_number: string;
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

interface CompanyDataCardProps {
  profile: AdminProfile | null;
  onUpdate: () => void;
}

export default function CompanyDataCard({
  profile,
  onUpdate
}: CompanyDataCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    legal_status: "individual",
    country: "BR", // Default to Brazil if phone starts with +55
    city: "",
    zip_code: "",
    address: "",
    document_number: ""
  });

  useEffect(() => {
    if (profile?.id) {
      loadCompanyData();
    }
  }, [profile?.id]);

  useEffect(() => {
    // Set Brazil as default country if phone starts with +55
    if (profile?.phone?.startsWith("+55") && !companyData.id) {
      setCompanyData((prev) => ({
        ...prev,
        country: "BR"
      }));
    }
  }, [profile?.phone]);

  async function loadCompanyData() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("company_data")
        .select("*")
        .eq("admin_id", profile?.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setCompanyData(data);
      } else if (profile?.phone?.startsWith("+55")) {
        // If no data exists and phone is Brazilian, set Brazil as default
        setCompanyData((prev) => ({
          ...prev,
          country: "BR"
        }));
      }
    } catch (err) {
      console.error("Erro ao carregar dados da empresa:", err);
      setError("Erro ao carregar dados da empresa");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const { data: existingData } = await supabase
        .from("company_data")
        .select("id")
        .eq("admin_id", profile?.id)
        .maybeSingle();

      if (existingData?.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("company_data")
          .update({
            ...companyData,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingData.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("company_data")
          .insert([
            {
              ...companyData,
              admin_id: profile?.id
            }
          ]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Erro ao salvar dados da empresa:", err);
      setError("Erro ao salvar dados da empresa");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Dados da Empresa
      </h3>

      {error && (
        <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          Dados salvos com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <CompanyInfoForm data={companyData} onChange={setCompanyData} />

        <PaymentMethodForm data={companyData} onChange={setCompanyData} />

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={loading}>{loading ? "Salvar..." : "Salvar"}</Button>
        </div>
      </form>
    </div>
  );
}
