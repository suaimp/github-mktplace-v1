import { useEffect, useState, useRef } from "react";
import { fetchRecentOrderItems, fetchAllOrderItems } from "./actions/getRecentOrders";
import { paginate } from "./actions/pagination";
 

//@ts-ignore
import { getOrderItems, OrderItem } from '../../../services/db-services/marketplace-services/order/OrderService'; 

import { getFaviconUrl } from '../../form/utils/formatters';
import { supabase } from '../../../lib/supabase';

// Função utilitária para mapear status para classes
function getStatusClass(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'success':
    case 'aprovado':
    case 'approved':
    case 'delivered':
      return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';
    case 'error':
    case 'rejected':
    case 'cancelado':
    case 'canceled':
      return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
    case 'warning':
    case 'pending':
    case 'pendente':
      return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400';
    case 'info':
      return 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500';
    case 'primary':
      return 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400';
    case 'light':
      return 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80';
    case 'dark':
      return 'bg-gray-500 text-white dark:bg-white/5 dark:text-white';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80';
  }
}

// Função utilitária para centralizar o botão ativo na paginação
function scrollToActivePageBtn(page: number, container: HTMLDivElement | null) {
  if (!container) return;
  const btn = document.getElementById(`page-btn-${page}`);
  if (btn && container) {
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
    container.scrollTo({ left: container.scrollLeft + offset, behavior: 'smooth' });
  }
}

export default function RecentOrdersTable() {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // @ts-ignore
  const [ordersPerPage, setOrdersPerPage] = useState(9);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
 
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
 
  const paginationRef = useRef<HTMLDivElement>(null);

  // Atualizar modo de filtro
  useEffect(() => {
    setCurrentPage(1);
    setIsFiltering(!!filterValue.trim());
  }, [showAll, filterValue]);

  useEffect(() => {
    async function fetchItems() {
      let items: OrderItem[] = [];
      // Buscar usuário logado e se é admin
      const { data: { user } } = await supabase.auth.getUser();
      let isAdmin = false;
      if (user) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        isAdmin = !!adminData;
      }
      const userId = user?.id;
      if (isFiltering || showAll) {
        const all = await fetchAllOrderItems(userId, isAdmin);
        if (all) items = all;
      } else {
        const recent = await fetchRecentOrderItems(userId, isAdmin);
        if (recent) items = recent;
      }
      setOrderItems(items);
    }
    fetchItems();
  }, [showAll, isFiltering]);

  // Filtro sobre orderItems
  const filteredItems = isFiltering && filterValue.trim()
    ? orderItems.filter(item =>
        item.product_name?.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.order_id?.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.publication_status?.toLowerCase().includes(filterValue.toLowerCase())
      )
    : orderItems;
  const totalPagesItems = (showAll || isFiltering) ? Math.ceil(filteredItems.length / ordersPerPage) : 1;
  // Paginação para modo 'Ver todos' ou filtrando
  let paginatedItems: OrderItem[];
  paginatedItems = paginate(filteredItems, 1, ordersPerPage);
  if (showAll || isFiltering) {
    paginatedItems = paginate(filteredItems, currentPage, ordersPerPage);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03] h-full" style={{height: '100%'}}>
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {(showAll || isFiltering) ? "Todos os Pedidos" : "Últimos Pedidos"}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {!showFilter ? (
            <button
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              onClick={() => setShowFilter(true)}
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
          ) : (
            <input
              type="text"
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              placeholder="Filtrar por cliente, email, id, valor ou data"
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              style={{ width: 93 }}
              autoFocus
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
      <div className="max-w-full overflow-x-auto custom-scrollbar" style={{height: '563px'}}>
        <table className="min-w-full w-full h-full">
          <thead className="border-gray-100 border-y dark:border-white/[0.05]">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400">Produto</th>
              <th className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400">ID</th>
              <th className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400">Valor</th>
              <th className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-gray-800 sm:px-6 text-start text-theme-sm dark:text-white/90 flex items-center gap-2">
                  <img src={getFaviconUrl(item.product_url || '')} alt="favicon" className="w-5 h-5 rounded" onError={e => (e.currentTarget.style.display = 'none')} />
                  {item.product_name}
                </td>
                <td className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                  {item.order_id.split("-")[0]}
                </td>
                <td className="px-4 text-theme-sm sm:px-6 text-start text-success-600">
                  {item.total_price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                  <span className={`inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm ${getStatusClass(item.publication_status || '-')}`}>{item.publication_status || '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginação apenas no modo 'Ver todos' ou filtrando */}
      {(showAll || isFiltering) && totalPagesItems > 1 && (
        <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6">
          <div className="flex items-center space-x-2 mb-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <div ref={paginationRef} className="flex items-center space-x-1 overflow-x-auto max-w-full scrollbar-thin pagination-slide-scroll">
              {(() => {
                const maxPages = 5;
                let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
                let end = start + maxPages - 1;
                if (end > totalPagesItems) {
                  end = totalPagesItems;
                  start = Math.max(1, end - maxPages + 1);
                }
                const pages: React.ReactNode[] = [];
                for (let page = start; page <= end; page++) {
                  pages.push(
                    <button
                      key={page}
                      id={`page-btn-${page}`}
                      onClick={() => {
                        setCurrentPage(page);
                        setTimeout(() => {
                          scrollToActivePageBtn(page, paginationRef.current);
                        }, 10);
                      }}
                      className={
                        `relative inline-flex items-center justify-center w-9 h-8 text-sm font-medium rounded-md transition-all duration-150 ` +
                        (currentPage === page
                          ? "bg-brand-500 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700")
                      }
                    >
                      {page}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPagesItems))}
              disabled={currentPage === totalPagesItems}
              className="relative inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-all duration-150 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}