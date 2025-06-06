import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LogoSettings from "./LogoSettings";
import SmtpSettings from "./SmtpSettings";
import StripeSettings from "./StripeSettings";

type TabType = "logo" | "smtp" | "stripe";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>("logo");

  return (
    <>
      <PageMeta
        title="Configurações | Admin Panel"
        description="Configurações do sistema"
      />
      <PageBreadcrumb pageTitle="Configurações" />
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Tabs Header */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 px-5 lg:px-6">
            <button
              onClick={() => setActiveTab("logo")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 ${
                activeTab === "logo"
                  ? "border-brand-500 text-brand-500 dark:text-brand-400"
                  : "border-transparent text-gray-500 dark:text-gray-400"
              }`}
            >
              Logo
            </button>
            <button
              onClick={() => setActiveTab("smtp")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 ${
                activeTab === "smtp"
                  ? "border-brand-500 text-brand-500 dark:text-brand-400"
                  : "border-transparent text-gray-500 dark:text-gray-400"
              }`}
            >
              SMTP
            </button>
            <button
              onClick={() => setActiveTab("stripe")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 ${
                activeTab === "stripe"
                  ? "border-brand-500 text-brand-500 dark:text-brand-400"
                  : "border-transparent text-gray-500 dark:text-gray-400"
              }`}
            >
              Pagamento Marketplace
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 lg:p-6">
          {activeTab === "logo" && <LogoSettings />}
          {activeTab === "smtp" && <SmtpSettings />}
          {activeTab === "stripe" && <StripeSettings />}
        </div>
      </div>
    </>
  );
}