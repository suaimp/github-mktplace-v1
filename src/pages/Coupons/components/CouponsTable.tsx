import React from "react";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from "../../../components/ui/table/index";

import { PencilIcon, TrashBinIcon, CopyIcon } from "../../../icons";
import { Coupon } from "../types";
import { useCouponTableSort } from "./useCouponTableSort";
import { formatDiscountType, formatDiscountValue, formatCurrency as formatCurrencyHelper } from "../helpers/formatters";

// Sistema de Toasts: utilize o hook useToast e o componente ToastContainer de ./toast para exibir mensagens de sucesso/erro padronizadas nesta feature.
// Exemplo:
// const { toasts, addToast, removeToast } = useToast();
// <ToastContainer toasts={toasts} onRemove={removeToast} />
// addToast('Mensagem', 'success');
//
// Veja NewCouponModal ou EditCouponForm para exemplos práticos.

interface CouponsTableProps {
  coupons: Coupon[];
  onDelete: (id: string) => void;
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onRefresh?: () => Promise<void>;
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

function formatCurrency(value: number) {
  return formatCurrencyHelper(value);
}

 

const CouponsTable: React.FC<CouponsTableProps> = ({
  coupons,
  onDelete,
 
  onToggleStatus,
 
}) => {
  const [toggles, setToggles] = React.useState<{ [id: string]: boolean }>(() => {
    const initial: { [id: string]: boolean } = {};
    coupons.forEach((coupon) => {
      initial[coupon.id] = coupon.is_active;
    });
    return initial;
  });

  React.useEffect(() => {
    setToggles((prev) => {
      const updated: { [id: string]: boolean } = { ...prev };
      coupons.forEach((coupon) => {
        updated[coupon.id] = coupon.is_active;
      });
      return updated;
    });
  }, [coupons]);

  // Hook de ordenação customizado
  const { sortField, sortDirection, handleSort } = useCouponTableSort("created_at", "desc");
  const navigate = useNavigate();

  // Ordenar os cupons
  const sortedCoupons = [...coupons].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    // Para datas
    if (sortField === "created_at" || sortField === "end_date") {
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

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o cupom "${name}"?`
    );
    if (!ok) return;
    onDelete(id);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // TODO: Adicionar toast de sucesso
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    return formatDiscountValue(coupon);
  };

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.is_active) {
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    }
    
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    }
    
    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.is_active) return "Inativo";
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) return "Expirado";
    return "Ativo";
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* Cabeçalhos com ordenação */}
                <TableCell
                  isHeader
                  className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  <div
                    className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                    onClick={() => handleSort("code")}
                  >
                    <span>Código</span>
                    {sortField === "code" && (
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
                    onClick={() => handleSort("name")}
                  >
                    <span>Nome</span>
                    {sortField === "name" && (
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
                    onClick={() => handleSort("discount_value")}
                  >
                    <span>Desconto</span>
                    {sortField === "discount_value" && (
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
                    onClick={() => handleSort("discount_type")}
                  >
                    <span>Tipo</span>
                    {sortField === "discount_type" && (
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
                    onClick={() => handleSort("usage_count")}
                  >
                    <span>Usos</span>
                    {sortField === "usage_count" && (
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
                    onClick={() => handleSort("end_date")}
                  >
                    <span>Validade</span>
                    {sortField === "end_date" && (
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
              {sortedCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copiar código"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {coupon.name}
                      </div>
                      {coupon.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {coupon.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {getDiscountDisplay(coupon)}
                      </div>
                      {coupon.minimum_amount && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Min: {formatCurrency(coupon.minimum_amount)}
                        </div>
                      )}
                      {coupon.maximum_amount && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Max: {formatCurrency(coupon.maximum_amount)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90 text-xs">
                        {formatDiscountType(coupon.discount_type)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {coupon.individual_use_only && (
                          <span className="inline-block px-1 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                            Individual
                          </span>
                        )}
                        {coupon.exclude_sale_items && (
                          <span className="inline-block px-1 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded">
                            Sem promoção
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {coupon.usage_limit ? 
                          `${coupon.usage_count}/${coupon.usage_limit}` : 
                          `${coupon.usage_count} (ilimitado)`
                        }
                      </div>
                      {coupon.usage_limit_per_customer && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Máx {coupon.usage_limit_per_customer}/cliente
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {coupon.end_date ? (
                      <div>
                        <div className="text-xs">Até:</div>
                        <div>{formatDate(coupon.end_date)}</div>
                      </div>
                    ) : (
                      "Sem expiração"
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(coupon)}`}
                    >
                      {getStatusText(coupon)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex gap-2 items-center">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Editar"
                        onClick={() => navigate(`/tickets/${coupon.id}`)}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                        title="Excluir"
                        onClick={() => handleDelete(coupon.id, coupon.name)}
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                      <Switch
                        checked={toggles[coupon.id]}
                        onChange={async (checked: boolean) => {
                          setToggles((prev) => ({
                            ...prev,
                            [coupon.id]: checked
                          }));
                          await onToggleStatus(coupon.id, checked);
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
              {coupons.length === 0 && (
                <TableRow>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhum cupom encontrado.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CouponsTable;
