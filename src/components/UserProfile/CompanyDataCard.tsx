import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import CompanyInfoForm from "./company/CompanyInfoForm";
 
import { supabase } from "../../lib/supabase";

interface AdminProfile {
  id: string;
  email: string;
  phone?: string;
  role?: string; // Adicionado para permitir checagem de admin
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    legal_status: "individual",
    country: "BR", // Default to Brazil if phone starts with +55
    city: "",
    zip_code: "",
    address: "",
    document_number: ""
  });

  useEffect(() => {
    if (profile && profile.id) {
      loadCompanyData();
    }
    // Corrigir dependência para evitar erro de profile possivelmente null
  }, [profile && profile.id]);

  useEffect(() => {
    // Set Brazil as default country if phone starts with +55
    if (profile && profile.phone?.startsWith("+55") && !companyData.id) {
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

      let query = supabase.from("company_data").select("*");
      if (profile && profile.role === 'admin') {
        query = query.eq("admin_id", profile.id);
      } else if (profile && profile.id) {
        query = query.eq("user_id", profile.id);
      }
      const { data, error: fetchError } = await query.maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setCompanyData(data);
      } else if (profile && profile.phone?.startsWith("+55")) {
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

      // Antes de inserir, verificar se já existe registro para o usuário
      let existingRow: any = null;
      if (profile) {
        let checkQuery = supabase.from("company_data").select("id");
        if (profile.role === 'admin') {
          checkQuery = checkQuery.eq("admin_id", profile.id);
        } else {
          checkQuery = checkQuery.eq("user_id", profile.id);
        }
        const { data: checkData } = await checkQuery.maybeSingle();
        existingRow = checkData;
      }

      if (existingRow && existingRow.id) {
        // Se já existe, faz update
        let admin_id: string | null = null;
        let user_id: string | null = null;
        if (profile && profile.id) {
          admin_id = profile.role === 'admin' ? profile.id : null;
          user_id = profile.role !== 'admin' ? profile.id : null;
        }
        const updatePayload = {
          ...companyData,
          updated_at: new Date().toISOString(),
          admin_id: admin_id as string | null,
          user_id: user_id as string | null
        };
        console.log('Payload UPDATE company_data:', updatePayload);
        const { error: updateError } = await supabase
          .from("company_data")
          .update(updatePayload)
          .eq("id", existingRow.id);
        if (updateError) throw updateError;
      } else {
        // Se não existe, faz insert
        let admin_id: string | null = null;
        let user_id: string | null = null;
        if (profile && profile.id) {
          admin_id = profile.role === 'admin' ? profile.id : null;
          user_id = profile.role !== 'admin' ? profile.id : null;
        }
        const insertPayload = {
          ...companyData,
          admin_id: admin_id as string | null,
          user_id: user_id as string | null
        };
        console.log('Payload INSERT company_data:', insertPayload);
        const { error: insertError } = await supabase
          .from("company_data")
          .insert([insertPayload]);
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
    <div className="space-y-8">
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
          <CompanyInfoForm
            data={companyData}
            onChange={(data) => setCompanyData({ ...companyData, ...data })}
          />

          <div className="flex justify-end pt-6">
            <Button disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>

      {/* <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
        <PaymentMethodForm
          data={companyData}
          onChange={(data) => setCompanyData({ ...companyData, ...data })}
        />

        <div className="flex justify-end pt-6">
          <Button
            disabled={loading}
            onClick={(e) => {
              if (e) {
                e.preventDefault();
              }
              handleSubmit(e as any);
            }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div> */}
    </div>
  );
}
