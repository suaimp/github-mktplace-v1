import { getRecentOrderItems, getAllOrderItems } from "../../../../services/db-services/marketplace-services/order/OrderService";

export async function fetchRecentOrderItems() {
  return await getRecentOrderItems();
}

export async function fetchAllOrderItems() {
  return await getAllOrderItems();
} 