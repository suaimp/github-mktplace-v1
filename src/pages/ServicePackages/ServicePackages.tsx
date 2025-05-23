import React, { useState, useEffect } from "react";
/* components */
import NewServiceBaseModal from "../../components/ServicePackages/NewServiceModal";
import ServicePackagesTable from "../../components/ServicePackages/ServicePackagesTable";
/* db */
import { getPublisherServices } from "../../context/db-context/services/publisherService";
import { ServicePackagesContext } from "../../context/ServicePackages/ServicePackagesContext";

const ServicePackages: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Defina fetchServices fora do useEffect para poder passar como prop
  const fetchServices = async () => {
    setLoading(true);
    const data = await getPublisherServices();
    if (data) {
      setPackages(
        data.map((item) => ({
          id: item.id,
          title: item.service_title,
          fields: 2, // ajuste conforme necessário
          service_type: item.service_type,
          updated_at: item.updated_at
        }))
      );
    } else {
      setPackages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <ServicePackagesContext.Provider value={{ fetchServices }}>
      <div>
        <h2
          className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          Serviços
        </h2>
        <NewServiceBaseModal
          field={{
            label: "Novo Serviço",
            modalTitle: "Adicionar novo serviço"
          }}
        />
        <ServicePackagesTable
          packages={packages}
          onDelete={(id: string) =>
            setPackages((prev) => prev.filter((p) => p.id !== id))
          }
        />
        {loading && (
          <div className="fixed bottom-6 right-6 z-[9999] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg px-6 py-3 text-gray-500 dark:text-gray-200 animate-fade-in">
            Carregando...
          </div>
        )}
      </div>
    </ServicePackagesContext.Provider>
  );
};

export default ServicePackages;
