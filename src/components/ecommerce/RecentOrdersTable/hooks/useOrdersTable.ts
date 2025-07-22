import { useState, useEffect } from 'react';
import { OrderItem } from '../../../../services/db-services/marketplace-services/order/OrderService';
import { fetchRecentOrderItems, fetchAllOrderItems } from '../actions/getRecentOrders';
import { supabase } from '../../../../lib/supabase';

export function useOrdersTable() {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(9);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

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

  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
    setFilterValue("");
  };

  const toggleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  return {
    showAll,
    currentPage,
    ordersPerPage,
    showFilter,
    filterValue,
    isFiltering,
    orderItems,
    setCurrentPage,
    setFilterValue,
    toggleShowAll,
    toggleFilter,
  };
}
