import { useState, useEffect } from "react";
 
import RecentOrdersTable from "../../components/ecommerce/RecentOrdersTable/RecentOrdersTable";
import AnalyticsSummary from "../../components/ecommerce/AnalyticsSummary";
import AnalyticsChart from "../../components/ecommerce/AnalyticsSummary/AnalyticsChart";
import { BestSellingSitesChart } from "../../components/ecommerce/LegendStyleExample";
import TopSitesPromoChart from "../../components/ecommerce/chart-TopSites/TopSitesPromoChart";

import FAQ from "../../components/ecommerce/FAQ";
import FeedbackForm from "../../components/ecommerce/FeedbackForm/FeedbackForm";
import PageMeta from "../../components/common/PageMeta";
import WelcomeMessage from "../../components/common/WelcomeMessage";
import { supabase } from "../../lib/supabase";

export default function Home() {
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
        pageTitle="Dashboard"
      />

      {/* Welcome Section */}
      {!isAdmin && <WelcomeMessage className="mb-8" />}

      {isAdmin ? (
        // Layout completo para admins
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 space-y-6 w-full">
            <AnalyticsSummary />
   
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="flex flex-col gap-6 xl:col-span-2">
                <AnalyticsChart />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <BestSellingSitesChart />
                  <TopSitesPromoChart />
                </div>
              </div>
              <div className="xl:col-span-1">
                <RecentOrdersTable />
              </div>
            </div>
          </div>

       
          <div className="col-span-12 xl:col-span-8">
            <FAQ />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <FeedbackForm />
          </div>
        </div>
      ) : (
        // Layout simplificado para usuários comuns
        <div className="grid grid-cols-12 gap-4 md:gap-6">
         
          <div className="col-span-12 xl:col-span-7">
            <FAQ />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <FeedbackForm />
          </div>
        </div>
      )}
    </>
  );
}
