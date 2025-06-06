import React, { useState, useEffect } from "react";
/* components */
import NewServiceBaseModal from "../../components/ServicePackages/NewServiceModal";
import ServicePackagesTable from "../../components/ServicePackages/ServicePackagesTable";
/* db */
import { getPublisherServices } from "../../context/db-context/services/publisherService";
import { getServiceCards } from "../../context/db-context/services/serviceCardService";
import { ServicePackagesContext } from "../../context/ServicePackages/ServicePackagesContext";

const ServicePackages: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Defina fetchServices fora do useEffect para poder passar como prop
  const fetchServices = async () => {
    setLoading(true);
    const data = await getPublisherServices();
    let cards: any[] = [];
    try {
      cards = (await getServiceCards()) || [];
    } catch (e) {
      cards = [];
    }
    if (data) {
      setPackages(
        data
          .map((item) => {
            const serviceId = item.id;
            const cardsCount = cards.filter(
              (c) => c.service_id === serviceId
            ).length;
            return {
              id: item.id,
              current_id: item.current_id, // Corrigido: agora o current_id é passado corretamente
              title: item.service_title,
              fields: cardsCount, // Agora mostra o número de cards
              service_type: item.service_type,
              updated_at: item.updated_at,
              is_active: item.is_active, // Adicionado para passar o status
              created_at: item.created_at, // Adicionado para ordenação na tabela
              service_id: item.id // Garante que service_id está presente
            };
          })
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
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
          onRefresh={fetchServices} // Passa fetchServices para a tabela
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
