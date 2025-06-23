import { supabase } from "../../../lib/supabase";

export interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  billing_name: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip_code: string;
  billing_document_number: string;
  phone: string;
  payment_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  entry_id?: string;
  product_name: string;
  product_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  niche?: any;
  service_content?: any;
  article_doc?: string;
  article_document_path?: string;
  article_url_status?: "pending" | "sent";
  publication_status?: "approved" | "rejected" | "pending";
  created_at: string;
}

export interface CreateOrderInput {
  payment_method: string;
  total_amount: number;
  billing_name: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip_code: string;
  billing_document_number: string;
  phone: string;
  payment_id?: string;
  metadata?: any;
  items: {
    entry_id?: string;
    product_name: string;
    product_url?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    niche?: any;
    service_content?: any;
  }[];
}

export async function createOrder(
  input: CreateOrderInput
): Promise<Order | null> {
  try {
    // Get current user
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    } // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          status: "pending",
          payment_method: input.payment_method,
          payment_status: "pending",
          total_amount: input.total_amount,
          billing_name: input.billing_name,
          billing_email: input.billing_email,
          billing_address: input.billing_address,
          billing_city: input.billing_city,
          billing_state: input.billing_state,
          billing_zip_code: input.billing_zip_code,
          billing_document_number: input.billing_document_number,
          phone: input.phone,
          payment_id: input.payment_id,
          metadata: input.metadata
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error("Failed to create order");

    // Insert order items
    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      entry_id: item.entry_id,
      product_name: item.product_name,
      product_url: item.product_url,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      niche: item.niche,
      service_content: item.service_content
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting user orders:", error);
    return null;
  }
}

export async function getOrderItems(
  orderId: string
): Promise<OrderItem[] | null> {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting order items:", error);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentStatus?: string
): Promise<boolean> {
  try {
    const updates: { status: string; payment_status?: string } = { status };

    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

export async function updateOrderPaymentId(
  orderId: string,
  paymentId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ payment_id: paymentId })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order payment ID:", error);
    return false;
  }
}

export async function simulateBoletoPaymentConfirmation(
  orderId: string
): Promise<boolean> {
  try {
    console.log("📋 Simulando confirmação de pagamento de boleto:", orderId);

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing"
      })
      .eq("id", orderId);

    if (error) throw error;

    console.log("✅ Pagamento de boleto confirmado com sucesso");
    return true;
  } catch (error) {
    console.error("Error confirming boleto payment:", error);
    return false;
  }
}

// Função para listar pedidos pendentes de boleto (para admin)
export async function getPendingBoletoOrders(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_method", "boleto")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting pending boleto orders:", error);
    return null;
  }
}

/**
 * Deletes all order items for a specific order
 */
export async function deleteOrderItems(orderId: string): Promise<boolean> {
  try {
    console.log("🗑️ Deleting order items for order:", orderId);

    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (error) {
      console.error("❌ Error deleting order items:", error);
      throw error;
    }

    console.log("✅ Order items deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting order items:", error);
    return false;
  }
}

/**
 * Deletes an order by ID (must delete order items first)
 */
export async function deleteOrderById(orderId: string): Promise<boolean> {
  try {
    console.log("🗑️ Deleting order:", orderId);

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      console.error("❌ Error deleting order:", error);
      throw error;
    }

    console.log("✅ Order deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
}

/**
 * Deletes an order and all its items (complete deletion)
 */
export async function deleteCompleteOrder(orderId: string): Promise<boolean> {
  try {
    console.log("🗑️ Starting complete order deletion:", orderId);

    // First, delete all order items (foreign key constraint)
    const itemsDeleted = await deleteOrderItems(orderId);
    if (!itemsDeleted) {
      throw new Error("Failed to delete order items");
    }

    // Then, delete the order itself
    const orderDeleted = await deleteOrderById(orderId);
    if (!orderDeleted) {
      throw new Error("Failed to delete order");
    }

    console.log("✅ Complete order deletion successful");
    return true;
  } catch (error) {
    console.error("❌ Error in complete order deletion:", error);
    return false;
  }
}
