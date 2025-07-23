import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
 import RecentOrdersTable from "../../components/ecommerce/RecentOrdersTable/RecentOrdersTable";

import FAQ from "../../components/ecommerce/FAQ";
import FeedbackForm from "../../components/ecommerce/FeedbackForm/FeedbackForm";
import WelcomeMessage from "../../components/common/WelcomeMessage";
import { supabase } from "../../lib/supabase";
import TopSitesPromoChart from "../../components/ecommerce/chart-TopSites/TopSitesPromoChart";
// import FavoriteSitesChart from "../../components/ecommerce/chart-FavoriteSites/FavoriteSitesChart";

export default function AdvertiserDashboard() {
  //@ts-ignore
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminRole();
  }, []);
  async function checkAdminRole() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("Dashboard: Nenhum usuário autenticado");
        setLoading(false);
        return;
      }

      console.log("Dashboard: Verificando admin para usuário:", user.id);

      // Verificar se o usuário é admin na tabela admins
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      console.log("Dashboard: Resultado da consulta admin:", {
        adminData,
        adminError,
      });

      if (adminData?.role === "admin") {
        console.log("Dashboard: Usuário é admin!");
        setIsAdmin(true);
      } else {
        console.log("Dashboard: Usuário não é admin");
      }
    } catch (error) {
      console.error("Erro ao verificar role de admin:", error);
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

  return (
    <>
      <PageMeta
        title="Dashboard do Anunciante | Platform"
        description="Painel de controle para anunciantes"
      />

      {/* Novo layout principal com grid de 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-start">
        {/* Primeira coluna */}
        <div className="flex flex-col gap-4 h-full">
          <WelcomeMessage className="mb-4" />
          <div className="w-full h-full">
            <div className="h-full">
              <TopSitesPromoChart />
            </div>
          </div>
        </div>
        {/* Segunda coluna */}
        <div>
          <RecentOrdersTable />
        </div>
        {/* Segunda linha */}
        <div className="h-full">
          <FAQ />
        </div>
        <div>
          <FeedbackForm />
        </div>
      </div>
    </>
  );
}
