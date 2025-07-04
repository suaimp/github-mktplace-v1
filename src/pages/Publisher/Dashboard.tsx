import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics/EcommerceMetrics";
import RecentOrdersTable from "../../components/ecommerce/RecentOrdersTable/RecentOrdersTable";

import FAQ from "../../components/ecommerce/FAQ";
import FeedbackForm from "../../components/ecommerce/FeedbackForm/FeedbackForm";
import WelcomeMessage from "../../components/common/WelcomeMessage";
import { supabase } from "../../lib/supabase";
import TopSitesPromoChart from "../../components/ecommerce/chart-TopSites/TopSitesPromoChart";
import FavoriteSitesChart from "../../components/ecommerce/chart-FavoriteSites/FavoriteSitesChart";

export default function PublisherDashboard() {
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
        title="Dashboard do Publisher | Platform"
        description="Painel de controle para publishers"
      />

      {/* Novo layout principal */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-stretch">
        {/* Coluna da esquerda */}
        <div className="flex flex-col flex-[1.3] gap-4">
          <WelcomeMessage className="mb-4" />
          <div className="flex flex-row gap-4 h-full">
            <div className="flex-1 h-full">
              <TopSitesPromoChart />
            </div>
            <div className="flex-1 h-full">
              <FavoriteSitesChart />
            </div>
          </div>
        </div>
        {/* Coluna da direita */}
        <div className="flex-1 min-w-[320px]">
          <RecentOrdersTable />
        </div>
      </div>

      {isAdmin ? (
        // Layout completo para admins
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 w-full">
            <EcommerceMetrics />
            <RecentOrdersTable />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <FeedbackForm />
          </div>
          <div className="col-span-12 xl:col-span-7">
            <FAQ />
          </div>
        </div>
      ) : (
        // Layout simplificado para usuários comuns
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-5">
            <FeedbackForm />
          </div>
          <div className="col-span-12 xl:col-span-7">
            <FAQ />
          </div>
        </div>
      )}
    </>
  );
}
