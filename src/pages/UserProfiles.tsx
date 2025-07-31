import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserPreferencesCard from "../components/UserProfile/UserPreferencesCard";
import CompanyDataCard from "../components/UserProfile/CompanyDataCard";
import AccountTypeCard from "../components/UserProfile/AccountTypeCard";
import LocalizationCard from "../components/UserProfile/LocalizationCard";
import PageMeta from "../components/common/PageMeta";
import { supabase } from "../lib/supabase";

interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  marketing_automation: boolean;
  newsletter: boolean;
  offer_suggestions: boolean;
  is_first_admin: boolean;
  created_at: string;
  updated_at: string;
}

type TabType = "profile" | "company" | "account" | "localization";

export default function UserProfiles() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Usuário não encontrado");
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

      if (adminError) {
        throw adminError;
      }

      setProfile(adminData);
      
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">{error}</div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", name: "Perfil" },
    { id: "company", name: "Dados da Empresa" },
   /*  { id: "account", name: "Tipo de Conta" },
    { id: "localization", name: "Idioma e Moeda" }, */
  ] as const;

  return (
    <>
      <PageMeta
        pageTitle="Minha Conta"
        description="Gerencie suas informações de conta"
      />
      <PageBreadcrumb pageTitle="Minha Conta" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Tabs Header */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 px-5 lg:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-500 dark:text-brand-400"
                    : "border-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 lg:p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <UserMetaCard profile={profile} />
              <UserInfoCard profile={profile} onUpdate={loadProfile} />
              <UserPreferencesCard profile={profile} onUpdate={loadProfile} />
            </div>
          )}

          {activeTab === "company" && (
            <CompanyDataCard profile={profile} onUpdate={loadProfile} />
          )}

          {activeTab === "account" && (
            <AccountTypeCard profile={profile} onUpdate={loadProfile} />
          )}

          {activeTab === "localization" && (
            <LocalizationCard profile={profile} />
          )}
        </div>
      </div>
    </>
  );
}