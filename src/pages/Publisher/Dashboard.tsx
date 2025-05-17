import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";

export default function PublisherDashboard() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: userData, error } = await supabase
        .from('platform_users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserName(`${userData.first_name} ${userData.last_name}`);
      
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