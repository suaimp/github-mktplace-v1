import { useEffect, useState } from "react";
import { fetchRecentOrders, fetchAllOrders } from "./actions/getRecentOrders";
import { useNavigate } from "react-router-dom";
import { filterOrders } from "./actions/filterOrders";
import type { Order } from "./actions/filterOrders";
import Button from "../../ui/button/Button";
import { EyeIcon } from "../../../icons";

 

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // @ts-ignore
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const navigate = useNavigate();

  // Carregar pedidos conforme modo e filtro
  useEffect(() => {
    async function fetchOrders() {
      if (isFiltering) {
        const data = await fetchAllOrders();
        if (data) setOrders(data);
      } else if (showAll) {
        const data = await fetchAllOrders();
        if (data) setOrders(data);
      } else {
        const data = await fetchRecentOrders();
        if (data) setOrders(data);
      }
    }
    fetchOrders();
  }, [showAll, isFiltering]);

  // Atualizar modo de filtro
  useEffect(() => {
    setCurrentPage(1);
    setIsFiltering(!!filterValue.trim());
  }, [showAll, filterValue]);

  // Filtro sempre sobre todos os pedidos quando ativo
  const filteredOrders = isFiltering && filterValue.trim()
    ? filterOrders(orders, filterValue)
    : orders;
  const totalPages = (showAll || isFiltering) ? Math.ceil(filteredOrders.length / ordersPerPage) : 1;
  const paginatedOrders = (showAll || isFiltering)
    ? filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
    : filteredOrders;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {(showAll || isFiltering) ? "Todos os Pedidos" : "Últimos Pedidos"}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              ></path>
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              ></path>
            </svg>
            Filtrar
          </button>
          {showFilter && (
            <input
              type="text"
              className="ml-2 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              placeholder="Filtrar por cliente, email, id, valor ou data"
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              style={{ minWidth: 220 }}
            />
          )}
          <button
            className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={() => { setShowAll((prev) => !prev); setFilterValue(""); }}
          >
            {(showAll || isFiltering) ? "Ver recentes" : "Ver todos"}
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100 dark:border-gray-800">
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Cliente
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  E-mail
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  ID do Pedido
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Valor
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Data
                </p>
              </th>
              <th className="px-6 py-3 text-left">
                <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Ações
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-6 py-3.5">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {order.billing_name}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.billing_email}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.id.split("-")[0]}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-theme-sm text-success-600">
                    {order.total_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </td>
                <td className="px-6 py-3.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    startIcon={<EyeIcon className="w-4 h-4 mr-2" />}
                  >
                    Ver Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginação apenas no modo 'Ver todos' */}
      {showAll && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6">
          <div className="flex items-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Exibindo
              <span className="font-medium ml-1">
                {(currentPage - 1) * ordersPerPage + 1}
              </span>
              a
              <span className="font-medium ml-1">
                {Math.min(currentPage * ordersPerPage, orders.length)}
              </span>
              de <span className="font-medium ml-1">{orders.length}</span> resultados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
