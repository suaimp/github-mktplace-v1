import React, { useEffect, useState } from "react";
import { getPublisherServices } from "./services/publisher_services_get";
import { TableIcon } from "../../../icons";

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
              <TableIcon className="inline w-4 h-4 mr-1" />
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
              <td className="px-3 py-2 dark:text-[#e4e7ec]">
                <select className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-900 text-black dark:text-[#e4e7ec] border-gray-200 dark:border-gray-700">
                  {Array.isArray(service.features) &&
                  service.features.length > 0 ? (
                    service.features.map((feature: string, idx: number) => (
                      <option
                        key={idx}
                        value={feature}
                        className="text-black dark:text-[#e4e7ec] bg-white dark:bg-gray-900"
                      >
                        {feature}
                      </option>
                    ))
                  ) : (
                    <option
                      value=""
                      className="text-black dark:text-[#e4e7ec] bg-white dark:bg-gray-900"
                    >
                      Nenhum recurso
                    </option>
                  )}
                </select>
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
