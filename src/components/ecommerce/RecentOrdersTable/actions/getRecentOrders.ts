import { getRecentOrders, getAllOrders } from "../../../../services/db-services/marketplace-services/order/OrderService";

export async function fetchRecentOrders() {
  return await getRecentOrders();
}

export async function fetchAllOrders() {
  return await getAllOrders();
} 