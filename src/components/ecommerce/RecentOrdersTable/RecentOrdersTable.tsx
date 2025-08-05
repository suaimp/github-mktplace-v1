import { useRef } from "react";
import { paginate } from "./actions/pagination";
import { OrderTableHeader } from "./components/OrderTableHeader";
import { OrderTableRowUpdated } from "./components/OrderTableRowUpdated";
import { useOrdersTableNew } from "./hooks/useOrdersTableNew";
import "./styles/TableStyles.css";
import { OrderTableData } from './interfaces/OrderTableTypes';

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
  const {
    showAll,
    currentPage,
    ordersPerPage,
    filterValue,
    isFiltering,
    orders,
    loading,
    setCurrentPage,
    toggleShowAll,
  } = useOrdersTableNew();
  
  const paginationRef = useRef<HTMLDivElement>(null);

  // Filtro sobre orders
  const filteredItems = isFiltering && filterValue.trim()
    ? orders.filter(item =>
        item.id?.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.status?.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.urls.some(url => url?.toLowerCase().includes(filterValue.toLowerCase()))
      )
    : orders;
  const totalPagesItems = (showAll || isFiltering) ? Math.ceil(filteredItems.length / ordersPerPage) : 1;
  // Paginação para modo 'Ver todos' ou filtrando
  let paginatedItems: OrderTableData[];
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
          <button
            className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={toggleShowAll}
          >
            {(showAll || isFiltering) ? "Recentes" : "Todos"}
          </button>
        </div>
      </div>
    <div className="max-w-full overflow-x-auto custom-scrollbar" style={{height: '563px'}}>
        <table className="recent-orders-table min-w-full w-full table-fixed" style={{ maxHeight: 'max-content' }}>
          <OrderTableHeader />
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  Carregando pedidos...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              paginatedItems.map((order) => (
                <OrderTableRowUpdated key={order.id} order={order} />
              ))
            )}
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
              aria-label="Página anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
              aria-label="Próxima página"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}