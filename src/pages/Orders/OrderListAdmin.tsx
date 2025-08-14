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
import { useOrderListAdmin } from "./hooks/useOrderListAdmin";
import { Pagination } from "../../components/EditorialManager/pagination/components";

/**
 * Componente de lista de pedidos com estratégia de admin consistente
 * Aplica a mesma verificação de admin do Dashboard
 */
export default function OrderListAdmin() {
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
  } = useOrderListAdmin();

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    // Se o pagamento está pendente, sempre mostrar "Pagamento Pendente" em vermelho
    if (paymentStatus === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
          Pagamento Pendente
        </span>
      );
    }

    switch (status) {
      case "completed":
        return <Badge color="success">Concluído</Badge>;
      case "processing":
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
            Aguardando artigo
          </span>
        );
      case "cancelled":
        return <Badge color="error">Cancelado</Badge>;
      case "pending":
        return <Badge color="warning">Pendente</Badge>;
      default:
        return <Badge color="dark">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge color="success">Pago</Badge>;
      case "pending":
        return <Badge color="warning">Pendente</Badge>;
      case "failed":
        return <Badge color="error">Falhou</Badge>;
      case "refunded":
        return <Badge color="dark">Reembolsado</Badge>;
      default:
        return <Badge color="dark">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Erro ao carregar pedidos</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Lista de Pedidos | TailAdmin - React.js Admin Dashboard Template"
        description="Esta é a página de lista de pedidos do TailAdmin - Template de Dashboard Admin em React.js com Tailwind CSS"
      />
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Pedidos" />
        
        {/* Header com informações de admin */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Pedidos {isAdmin && <span className="text-brand-500">(Admin - Todos os registros)</span>}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdmin 
                ? `Visualizando todos os ${filteredOrders.length} pedidos do sistema` 
                : `Seus ${filteredOrders.length} pedidos`
              }
            </p>
          </div>
        </div>

        {/* Filtros e controles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por ID, nome, email, telefone, status..."
                value={searchTerm}
                onChange={handleSearch}
                className="dark:bg-dark-900 shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all duration-200 focus:border-[#465fff] focus:ring-[3px] focus:ring-[color-mix(in_oklab,#465fff_10%,transparent)] focus:shadow-[inset_0_0_0_3px_color-mix(in_oklab,#465fff_10%,transparent)] dark:focus:border-[#465fff]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Por página:
              </label>
              <select
                value={ordersPerPage}
                onChange={handleOrdersPerPageChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de pedidos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('id')}
                  >
                    ID do Pedido
                    {sortField === 'id' && (
                      <span className="ml-1">{/* sortDirection === 'asc' ? '↑' : '↓' */}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('billing_name')}
                  >
                    Cliente
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('total_amount')}
                  >
                    Valor
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('payment_status')}
                  >
                    Pagamento
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Nenhum pedido encontrado com os filtros aplicados.' : 'Nenhum pedido encontrado.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="px-6 py-4">
                        <button
                          onClick={() => copyToClipboard(order.id, 'ID')}
                          className="font-mono text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                          title="Clique para copiar"
                        >
                          #{order.id.slice(0, 8)}
                        </button>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.billing_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.billing_email}
                          </div>
                          {order.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPhone(order.phone)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(order.total_amount)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.payment_method}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(order.status, order.payment_status)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getPaymentStatusBadge(order.payment_status)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(order.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="flex items-center gap-1"
                        >
                          Ver detalhes
                          <ArrowRightIcon className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={ordersPerPage}
              onPageChange={setCurrentPage}
              itemLabel="pedidos"
            />
          </div>
        )}
      </div>
    </>
  );
}
