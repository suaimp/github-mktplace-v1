import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";

export default function PublisherDashboard() {
  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      // Now profileData contains the user's profile information
      // You can use it as needed, for example setting it in state
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  }

  return (
    <>
      <PageMeta
        title="Dashboard do Publisher | Platform"
        description="Painel de controle para publishers"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
