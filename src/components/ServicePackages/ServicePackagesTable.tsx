import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from "../../components/ui/table/index";
import ServiceEditModal from "./ServiceEditModal";

import { PencilIcon, TrashBinIcon, SettingsMinimalIcon } from "../../icons";
import { deletePublisherService } from "../../context/db-context/services/publisherService";

interface ServicePackage {
  id: string;
  current_id: string;
  title: string;
  fields: number;
  service_type: string;
  updated_at: string;
}

interface ServicePackagesTableProps {
  packages: ServicePackage[];
  onDelete: (id: string) => void; // Adicione uma prop para atualizar a lista no componente pai
}

interface ServicePackagesTableProps {
  packages: ServicePackage[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const ServicePackagesTable: React.FC<ServicePackagesTableProps> = ({
  packages,
  onDelete
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setEditOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o serviço "${title}"?`
    );
    if (!ok) return;
    const success = await deletePublisherService(id);
    if (success) {
      onDelete(id);
    } else {
      alert("Erro ao excluir serviço.");
    }
  };

  return (
    <>
      <ServiceEditModal
        serviceId={selectedId || ""}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Título
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Cards
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Tipo de Serviço
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Última atualização
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {pkg.title}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {pkg.fields} {pkg.fields === 1 ? "Card" : "Cards"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {pkg.service_type}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(pkg.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                          onClick={() => {
                            console.log("current_id:", pkg.current_id);
                            navigate(`/service-packages/${pkg.current_id}`);
                          }}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Configurações"
                          onClick={() => handleEdit(pkg.id)}
                        >
                          <SettingsMinimalIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Excluir"
                          onClick={() => handleDelete(pkg.id, pkg.title)}
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {packages.length === 0 && (
                  <TableRow>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePackagesTable;
