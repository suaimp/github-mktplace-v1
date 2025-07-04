import { getRecentOrderItems, getAllOrderItems } from "../../../../services/db-services/marketplace-services/order/OrderService";

export async function fetchRecentOrderItems(userId?: string, isAdmin?: boolean) {
  return await getRecentOrderItems(userId, isAdmin);
}

export async function fetchAllOrderItems(userId?: string, isAdmin?: boolean) {
  return await getAllOrderItems(userId, isAdmin);
} 