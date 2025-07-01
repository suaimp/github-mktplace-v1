import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/RecentOrdersTable/RecentOrdersTable";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";

import FAQ from "../../components/ecommerce/FAQ";
import FeedbackForm from "../../components/ecommerce/FeedbackForm/FeedbackForm";
import PageMeta from "../../components/common/PageMeta";
import WelcomeMessage from "../../components/common/WelcomeMessage";

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      {/* Welcome Section */}
      <WelcomeMessage className="mb-8" />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <FeedbackForm />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <FAQ />
        </div>
      </div>
    </>
  );
}
