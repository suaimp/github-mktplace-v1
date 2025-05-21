import React, { useEffect, useState } from "react";
import { getPublisherServices } from "./services/publisher_services_get";

interface ServiceTableFieldProps {
  field: any;
  settings: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function ServiceTableField({}: ServiceTableFieldProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const data = await getPublisherServices();
        setServices(data || []);
      } catch (err: any) {
        setError("Erro ao carregar serviços");
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  if (loading) return <div>Carregando serviços...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-3 py-2 text-left dark:text-[#e4e7ec] border-b border-gray-200 dark:border-gray-700">
              Título
            </th>
            <th className="px-3 py-2 text-left dark:text-[#e4e7ec] border-b border-gray-200 dark:border-gray-700">
              Preço
            </th>
            <th className="px-3 py-2 text-left dark:text-[#e4e7ec] border-b border-gray-200 dark:border-gray-700">
              Preço Promocional
            </th>
            <th className="px-3 py-2 text-left dark:text-[#e4e7ec] border-b border-gray-200 dark:border-gray-700">
              Recursos
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr
              key={service.id}
              className="border-b last:border-0 border-gray-200 dark:border-gray-700"
            >
              <td className="px-3 py-2 dark:text-[#e4e7ec]">
                {service.service_title}
              </td>
              <td className="px-3 py-2 dark:text-[#e4e7ec]">
                R${" "}
                {Number(service.price).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2
                })}
              </td>
              <td className="px-3 py-2 dark:text-[#e4e7ec]">
                {service.promo_price
                  ? `R$ ${Number(service.promo_price).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2
                    })}`
                  : "-"}
              </td>
              <td className="px-3 py-2 dark:text-[#e4e7ec] relative">
                <ServiceFeaturesBox features={service.features} />
              </td>
            </tr>
          ))}
          {services.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="text-center py-4 text-gray-400 dark:text-[#e4e7ec]"
              >
                Nenhum serviço encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ServiceFeaturesBox({ features }: { features: string[] }) {
  const [open, setOpen] = useState(false);
  const hasFeatures = Array.isArray(features) && features.length > 0;

  if (!hasFeatures) {
    return (
      <div className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-400 dark:text-[#e4e7ec] border-gray-200 dark:border-gray-700">
        Nenhum recurso
      </div>
    );
  }

  return (
    <div
      className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-900 text-black dark:text-[#e4e7ec] border-gray-200 dark:border-gray-700 relative flex items-center"
      tabIndex={0}
      onBlur={() => setOpen(false)}
      style={{ minHeight: 20 }}
    >
      <span className="flex-1 truncate">{features[0]}</span>
      {features.length > 1 && (
        <button
          type="button"
          className="absolute right-0 top-0 h-full px-3 rounded-none rounded-r bg-gray-200 dark:bg-gray-800  border-l border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          style={{ zIndex: 2 }}
          onClick={() => setOpen((v) => !v)}
          tabIndex={-1}
        >
          Ver demais recursos
        </button>
      )}
      {features.length > 1 && (
        <div
          className="absolute left-0 top-full mt-1 min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10"
          style={{
            maxHeight: 120,
            height: 120,
            overflowY: "scroll",
            scrollbarWidth: "auto",
            display: open ? "block" : "block",
            visibility: open ? "visible" : "hidden"
          }}
        >
          {open &&
            features.map((feature: string, idx: number) => (
              <div
                key={idx}
                className="px-2 py-1 text-black dark:text-[#e4e7ec] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {feature}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
