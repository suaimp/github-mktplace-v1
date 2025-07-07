import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { ArrowRightIcon } from "../../icons";
import { formatCurrency } from "../../components/marketplace/utils";
import { formatPhone } from "../../utils/phoneValidation";
import { useOrderList } from "./actions/useOrderList";

export default function OrderList() {
  const {
    paginatedOrders,
    loading,
    error,
    isAdmin,
    searchTerm,
    ordersPerPage,
    currentPage,
    totalPages,
    filteredOrders,
    handleViewOrder,
    copyToClipboard,
    formatDate,
    handleSearch,
    handleOrdersPerPageChange,
    setCurrentPage,
    sortField,
 
    handleSort
  } = useOrderList();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge color="success">Concluído</Badge>;
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
            Aguardando artigo
          </span>
        );
      case "cancelled":
        return <Badge color="error">Cancelado</Badge>;
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
            Pagamento Pendente
          </span>
        );
    }
  };
 //@ts-ignore
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge color="success">Pago</Badge>;
      case "processing":
        return <Badge color="warning">Processando</Badge>;
      case "failed":
        return <Badge color="error">Falhou</Badge>;
      case "pending":
      default:
        return <Badge color="info">Pendente</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Cartão de Crédito";
      case "pix":
        return "PIX";
      case "boleto":
        return "Boleto";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Meus Pedidos | Marketplace"
        description="Lista de pedidos realizados"
      />{" "}
      <PageBreadcrumb pageTitle="Meus Pedidos" />
      {error && (
        <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Table Controls */}
        <div className="flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">Show</span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={ordersPerPage}
                onChange={handleOrdersPerPageChange}
              >
                <option
                  value="10"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  10
                </option>
                <option
                  value="25"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  25
                </option>
                <option
                  value="50"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  50
                </option>
                <option
                  value="100"
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  100
                </option>
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
            <span className="text-gray-500 dark:text-gray-400">entries</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  ></path>
                </svg>
              </button>
              <input
                placeholder="Buscar pedidos..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                type="text"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              {" "}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("id")}
                    >
                      <span className="flex items-center gap-1 h-full">
                        <span>Pedido</span>
                        {sortField === "id" && (
                          <span className="flex flex-col gap-0.5 ml-1">
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                            </svg>
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell
                      isHeader
                      className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      <div
                        className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                        onClick={() => handleSort("billing_name")}
                      >
                        <span className="flex items-center gap-1 h-full">
                          <span>Cliente</span>
                          {sortField === "billing_name" && (
                            <span className="flex flex-col gap-0.5 ml-1">
                              <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                              </svg>
                              <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                              </svg>
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("created_at")}
                    >
                      <span className="flex items-center gap-1 h-full">
                        <span>Data</span>
                        {sortField === "created_at" && (
                          <span className="flex flex-col gap-0.5 ml-1">
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                            </svg>
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("status")}
                    >
                      <span className="flex items-center gap-1 h-full">
                        <span>Status</span>
                        {sortField === "status" && (
                          <span className="flex flex-col gap-0.5 ml-1">
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                            </svg>
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("payment_method")}
                    >
                      <span className="flex items-center gap-1 h-full">
                        <span>Método</span>
                        {sortField === "payment_method" && (
                          <span className="flex flex-col gap-0.5 ml-1">
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                            </svg>
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("total_amount")}
                    >
                      <span className="flex items-center gap-1 h-full">
                        <span>Total</span>
                        {sortField === "total_amount" && (
                          <span className="flex flex-col gap-0.5 ml-1">
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                            </svg>
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <div
                      className="absolute inset-0 w-full h-full flex items-center gap-1 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 outline-none px-5 py-3"
                      onClick={() => handleSort("acoes")}
                    >
                      <span className="flex items-center gap-1 h-full">
                        <span>Ações</span>
                        {sortField === "acoes" && (
                          <span className="flex flex-col gap-0.5 ml-1">
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                            </svg>
                            <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>{" "}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      {" "}
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.id.substring(0, 8)}
                        </span>
                      </TableCell>{" "}
                      {isAdmin && (
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white/90">
                              {order.billing_name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{order.billing_email}</span>
                              <button
                                onClick={() =>
                                  copyToClipboard(order.billing_email, "Email")
                                }
                                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Copiar email"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <path
                                    d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H16M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M12 12H16M12 16H16"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>{" "}
                            {order.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{formatPhone(order.phone)}</span>
                                <button
                                  onClick={() => {
                                    const phoneNumber = order.phone.replace(
                                      /\D/g,
                                      ""
                                    ); // Remove tudo que não é número
                                    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${phoneNumber}`;
                                    window.open(whatsappUrl, "_blank");
                                  }}
                                  className="p-0.5 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Abrir WhatsApp"
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-green-500 hover:text-green-600 dark:hover:text-green-400"
                                  >
                                    <path
                                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {getPaymentMethodLabel(order.payment_method)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          Detalhes
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {isAdmin
                        ? "Nenhum pedido encontrado no sistema."
                        : "Você ainda não realizou nenhum pedido."}
                    </td>
                  </TableRow>
                )}{" "}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6">
            <div className="flex items-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * ordersPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * ordersPerPage, filteredOrders.length)}
                </span>{" "}
                of <span className="font-medium">{filteredOrders.length}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "bg-brand-500 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>{" "}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
