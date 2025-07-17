import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from "../../components/ui/table/index";
import ServiceEditModal from "./ServiceEditModal";

import { PencilIcon, TrashBinIcon, SettingsMinimalIcon } from "../../icons";
import {
  deletePublisherService,
  setActivePublisherService
} from "../../services/db-services/user/publisher/publisherService";

interface ServicePackage {
  id: string;
  current_id: string;
  title: string;
  fields: number;
  service_type: string;
  updated_at: string;
  is_active: boolean;
  publisher_id: string; // Adicionado para passar ao toggle
  created_at: string; // Adicionado para permitir ordenação por created_at
  service_id: string; // Adicionado para receber service_id
}

interface ServicePackagesTableProps {
  packages: ServicePackage[];
  onDelete: (id: string) => void;
  onRefresh?: () => Promise<void>; // Adicionado para recarregar dados do backend
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
  onDelete,
  onRefresh // Recebe função de recarregar dados
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [toggles, setToggles] = useState<{ [id: string]: boolean }>(() => {
    const initial: { [id: string]: boolean } = {};
    packages.forEach((pkg) => {
      initial[pkg.id] = pkg.is_active;
    });
    return initial;
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    setToggles((prev) => {
      const updated: { [id: string]: boolean } = { ...prev };
      packages.forEach((pkg) => {
        updated[pkg.id] = pkg.is_active;
      });
      return updated;
    });
  }, [packages]); // Remove refreshFlag do array de dependências

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

  // Estado de ordenação
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Função para alternar ordenação
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Ordenar os pacotes
  const sortedPackages = [...packages].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    // Para datas
    if (sortField === "created_at" || sortField === "updated_at") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    // Para strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // Para números
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    // Para booleanos
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }
    // Para undefined/null
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return 0;
  });

  // Agrupa por service_type mantendo a ordem de created_at
  const groupedPackages: { [key: string]: ServicePackage[] } = {};
  sortedPackages.forEach((pkg) => {
    if (!groupedPackages[pkg.service_type])
      groupedPackages[pkg.service_type] = [];
    groupedPackages[pkg.service_type].push(pkg);
  });

  const groupOrder = Object.keys(groupedPackages);

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
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("title")}
                    >
                      <span>Título</span>
                      {sortField === "title" && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("fields")}
                    >
                      <span>Cards</span>
                      {sortField === "fields" && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("service_type")}
                    >
                      <span>Tipo de Serviço</span>
                      {sortField === "service_type" && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("updated_at")}
                    >
                      <span>Última atualização</span>
                      {sortField === "updated_at" && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("is_active")}
                    >
                      <span>Status</span>
                      {sortField === "is_active" && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left select-none px-5 py-3"
                    >
                      <span>Ações</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {groupOrder.map((group) => (
                  <React.Fragment key={group}>
                    {/* Removido o título do grupo */}
                    {groupedPackages[group].map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {pkg.title}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {pkg.fields} {pkg.fields <= 1 ? "Card" : "Cards"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {pkg.service_type}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(pkg.updated_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {pkg.is_active === true ? (
                            <span
                              className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold"
                              onClick={() => console.log(pkg)}
                            >
                              Ativo
                            </span>
                          ) : (
                            <span
                              className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-semibold"
                              onClick={() => console.log(pkg)}
                            >
                              Inativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex gap-2 items-center">
                            <button
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Editar"
                              onClick={() => {
                                console.log("id:", pkg.id);
                                navigate(`/service-packages/${pkg.id}`);
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
                            <Switch
                              checked={toggles[pkg.id]}
                              onChange={async (checked: boolean) => {
                                setToggles((prev) => ({
                                  ...prev,
                                  [pkg.id]: checked
                                }));
                                await setActivePublisherService(
                                  pkg.id,
                                  pkg.current_id,
                                  pkg.service_type,
                                  checked
                                );
                                if (onRefresh) {
                                  await onRefresh(); // Recarrega dados do backend
                                }
                              }}
                              onColor="#3b82f6"
                              offColor="#d1d5db"
                              checkedIcon={false}
                              uncheckedIcon={false}
                              height={16}
                              width={32}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
                {packages.length === 0 && (
                  <TableRow>
                    <td
                      colSpan={6}
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
