import { useState, useEffect } from 'react';
import { fetchRecentOrdersWithUrls, fetchOrdersWithUrls } from '../db-service/ordersTableService';
import { OrderTableData } from '../interfaces/OrderTableTypes';
import { verifyAdminStatus } from '../services/adminVerificationServiceNew';

export function useOrdersTableNew() {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(9);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [orders, setOrders] = useState<OrderTableData[]>([]);
  const [loading, setLoading] = useState(true);

  // Atualizar modo de filtro
  useEffect(() => {
    setCurrentPage(1);
    setIsFiltering(!!filterValue.trim());
  }, [showAll, filterValue]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        // Verificar status de administrador usando o serviço dedicado
        const adminVerification = await verifyAdminStatus();
        const { isAdmin, userId } = adminVerification;

        let fetchedOrders: OrderTableData[] = [];
        
        if (showAll || isFiltering) {
          fetchedOrders = await fetchOrdersWithUrls(isAdmin ? undefined : userId || undefined, isAdmin);
        } else {
          fetchedOrders = await fetchRecentOrdersWithUrls(isAdmin ? undefined : userId || undefined, isAdmin);
        }

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [showAll, isFiltering]);

  const toggleShowAll = () => {
    setShowAll(prev => !prev);
    setCurrentPage(1);
  };

  return {
    showAll,
    currentPage,
    ordersPerPage,
    showFilter,
    filterValue,
    isFiltering,
    orders,
    loading,
    setCurrentPage,
    setShowFilter,
    setFilterValue,
    toggleShowAll,
  };
}
