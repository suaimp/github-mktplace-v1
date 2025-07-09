import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { getFlagUrl, getFaviconUrl } from "../form/utils/formatters";
import { supabase } from "../../lib/supabase";
import { processProductValue } from "./actions";
import { useState } from "react";

interface FormEntry {
  id: string;
  created_at: string;
  status: string;
  created_by: string | null;
  publisher?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  values: Record<string, any>;
}

interface FormEntriesTableProps {
  entries: FormEntry[];
  fields: any[];
  urlFields?: string[];
  onEdit?: (entry: FormEntry) => void;
  onDelete?: (entryId: string) => void;
  show?: boolean;
}

export default function FormEntriesTable({
  entries,
  fields,
  urlFields = [],
  onEdit,
  onDelete,
  show = true,
}: FormEntriesTableProps) {
  if (!show) return null;

  // ESTADOS DE ORDENAÇÃO
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  // ESTADO DE PAGINAÇÃO
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // FUNÇÃO DE ORDENAÇÃO
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // FUNÇÃO DE COMPARAÇÃO
  const compare = (a: any, b: any, field: string) => {
    let aValue, bValue;
    if (field === "created_at") {
      aValue = a.created_at;
      bValue = b.created_at;
    } else if (field === "publisher") {
      aValue = a.publisher?.first_name + " " + a.publisher?.last_name;
      bValue = b.publisher?.first_name + " " + b.publisher?.last_name;
    } else if (field === "status") {
      aValue = a.status;
      bValue = b.status;
    } else {
      aValue = a.values[field];
      bValue = b.values[field];
    }
    if (aValue === undefined || aValue === null) aValue = "";
    if (bValue === undefined || bValue === null) bValue = "";
    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue, "pt", { sensitivity: "base" });
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }
    // fallback para string
    return String(aValue).localeCompare(String(bValue), "pt", { sensitivity: "base" });
  };

  // ORDENAR ENTRIES
  const sortedEntries = [...entries].sort((a, b) => {
    const res = compare(a, b, sortField);
    return sortDirection === "asc" ? res : -res;
  });

  // PAGINAÇÃO
  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage) || 1;
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Corrigir currentPage se mudar o filtro
  if (currentPage > totalPages) setCurrentPage(totalPages);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatValue = (value: any, fieldType: string, fieldId: string) => {
    if (!value) return "-";

    // Special handling for URL fields
    if (fieldType === "url" || urlFields.includes(fieldId)) {
      return renderUrlWithFavicon(value);
    }

    // Special handling for brand fields
    if (fieldType === "brand") {
      return renderBrandWithLogo(value);
    }

    // Handle country fields
    if (fieldType === "country" && typeof value === "object") {
      return renderCountryFlags(value, fieldId);
    }

    switch (fieldType) {
      case "file":
        return Array.isArray(value)
          ? `${value.length} arquivo(s)`
          : "1 arquivo";

      case "checkbox":
      case "multiselect":
        return Array.isArray(value) ? value.join(", ") : value;

      case "toggle":
        return value ? "Sim" : "Não";

      case "product":
        return processProductValue(value);

      case "commission":
        const commission = parseFloat(value);
        return !isNaN(commission) ? `${commission}%` : value;

      case "brazilian_states":
        if (typeof value === "object") {
          const { state_name, city_names, state, cities } = value;
          if (Array.isArray(city_names) && city_names.length > 0) {
            return (
              <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
                {state_name} - {city_names.join(", ")}
              </span>
            );
          } else if (Array.isArray(cities) && cities.length > 0) {
            return (
              <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
                {state_name} - {cities.join(", ")}
              </span>
            );
          }
          return (
            <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
              {state_name || state || "-"}
            </span>
          );
        }
        return value.toString();

      default:
        return value.toString();
    }
  };

  // Render URL with favicon - without truncation
  const renderUrlWithFavicon = (url: string) => {
    if (!url) return "-";

    // Clean up the URL to remove protocol and trailing slash
    let displayUrl = url;

    // Remove protocol (http:// or https://)
    displayUrl = displayUrl.replace(/^https?:\/\//, "");

    // Remove trailing slash
    displayUrl = displayUrl.replace(/\/$/, "");

    return (
      <div className="flex items-center gap-2">
        <img
          src={getFaviconUrl(url)}
          alt="Site icon"
          width="20"
          height="20"
          className="flex-shrink-0"
          onError={(e) => {
            // Fallback if favicon fails to load
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 hover:underline whitespace-nowrap"
        >
          {displayUrl}
        </a>
      </div>
    );
  };

  // Render brand with logo
  const renderBrandWithLogo = (value: any) => {
    try {
      // Parse the brand data if it's a string
      const brandData = typeof value === "string" ? JSON.parse(value) : value;

      if (!brandData || !brandData.name) return "-";

      // If there's no logo, just return the name
      if (!brandData.logo) return brandData.name;

      // Get the logo URL from storage
      const logoUrl = getBrandLogoUrl(brandData.logo);

      return (
        <div className="flex items-center gap-2">
          <img
            src={logoUrl}
            alt={`${brandData.name} logo`}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback if logo fails to load
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-gray-800 dark:text-white/90 font-medium">
            {brandData.name}
          </span>
        </div>
      );
    } catch (err) {
      console.error("Error rendering brand:", err);
      return value?.toString() || "-";
    }
  };

  // Get brand logo URL from storage
  const getBrandLogoUrl = (logoPath: string): string => {
    if (!logoPath) return "";

    try {
      const { data } = supabase.storage
        .from("brand_logos")
        .getPublicUrl(logoPath);

      return data?.publicUrl || "";
    } catch (err) {
      console.error("Error getting brand logo URL:", err);
      return "";
    }
  };

  // Find field settings by field ID
  const getFieldSettings = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return null;
    return field.form_field_settings;
  };

  // Render country flags with codes or percentages
  const renderCountryFlags = (
    countries: Record<string, any>,
    fieldId: string
  ) => {
    if (!countries || Object.keys(countries).length === 0) return "-";

    // Check if we should show country codes instead of percentages
    const fieldSettings = getFieldSettings(fieldId);
    const showCountryCodes = fieldSettings?.show_percentage === true;

    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(countries).map(([countryCode, percentage]) => (
          <div
            key={countryCode}
            className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1"
          >
            <img
              src={getFlagUrl(countryCode)}
              alt={countryCode}
              width="20"
              height="20"
              className={`rounded-full ${
                countryCode === "ROW" ? "dark:invert" : ""
              }`}
              onError={(e) => {
                // Fallback if flag fails to load
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {showCountryCodes ? (
              <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                {countryCode}
              </span>
            ) : percentage ? (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                ({percentage}%)
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  // Filter out admin-only fields
  const visibleFields = fields.filter((field) => {
    const settings = field.form_field_settings;
    return !settings || settings.visibility !== "admin";
  });

  // SVG SETAS (exatamente igual MarketplaceTable, só aparecem na coluna ordenada)
  const SortArrows = ({ show }: { show: boolean }) => (
    show ? (
      <span className="flex flex-col gap-0.5 ml-1">
        <svg
          className="w-2 h-1.5 fill-gray-300 dark:fill-gray-700"
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
            fill=""
          ></path>
        </svg>
        <svg
          className="w-2 h-1.5 fill-gray-300 dark:fill-gray-700"
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
            fill=""
          ></path>
        </svg>
      </span>
    ) : null
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Seletor Mostrar registros */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl">
        <span className="text-gray-500 dark:text-gray-400">Mostrar</span>
        <div className="relative z-20 bg-transparent">
          <select
            className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            value={entriesPerPage}
            onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
            <svg
              className="stroke-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                stroke=""
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">registros</span>
      </div>
      {/* Tabela */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* DATA */}
                <th className="h-12 relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group">
                  <div
                    className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    onClick={() => handleSort("created_at")}
                  >
                    <span className="flex items-center">
                      Data
                      <SortArrows show={sortField === "created_at"} />
                    </span>
                  </div>
                </th>
                {/* CAMPOS DINÂMICOS */}
                {visibleFields.map((field) => (
                  <th
                    key={field.id}
                    className="h-12 relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                      onClick={() => handleSort(field.id)}
                    >
                      <span className="flex items-center">
                        {field.label}
                        <SortArrows show={sortField === field.id} />
                      </span>
                    </div>
                  </th>
                ))}
                {/* PUBLISHER */}
                <th className="h-12 relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group">
                  <div
                    className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    onClick={() => handleSort("publisher")}
                  >
                    <span className="flex items-center">
                      Publisher
                      <SortArrows show={sortField === "publisher"} />
                    </span>
                  </div>
                </th>
                {/* STATUS */}
                <th className="h-12 relative px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 group">
                  <div
                    className="absolute inset-0 w-full h-full flex items-center px-5 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    onClick={() => handleSort("status")}
                  >
                    <span className="flex items-center">
                      Status
                      <SortArrows show={sortField === "status"} />
                    </span>
                  </div>
                </th>
                {/* AÇÕES (não ordenável) */}
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Ações
                </th>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/10 transition"
                >
                  <td className="px-5 py-4 sm:px-6 text-start whitespace-nowrap">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatDate(entry.created_at)}
                    </span>
                  </td>
                  {visibleFields.map((field) => (
                    <td
                      key={field.id}
                      className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap"
                    >
                      {formatValue(
                        entry.values[field.id],
                        field.field_type,
                        field.id
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {entry.publisher ? (
                      <div>
                        <div className="font-medium">
                          {entry.publisher.first_name} {" "}
                          {entry.publisher.last_name}
                        </div>
                        <div className="text-xs">{entry.publisher.email}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    <Badge
                      color={
                        entry.status === "verificado"
                          ? "success"
                          : entry.status === "reprovado"
                          ? "error"
                          : "warning"
                      }
                    >
                      {entry.status === "verificado"
                        ? "Verificado"
                        : entry.status === "reprovado"
                        ? "Reprovado"
                        : "Em Análise"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Tem certeza que deseja excluir este registro?"
                              )
                            ) {
                              onDelete(entry.id);
                            }
                          }}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Excluir"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </TableRow>
              ))}
              {paginatedEntries.length === 0 && (
                <TableRow>
                  <td
                    colSpan={visibleFields.length + 4}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhum registro encontrado
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Paginação simples (opcional) */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 px-4 py-2">
          <button
            className="px-2 py-1 text-sm text-gray-500 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="px-2 py-1 text-sm text-gray-500 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
