// Test script to verify order deletion
// Execute this in the browser console to test order deletion

async function testOrderDeletion() {
  console.log('=== TESTE DE EXCLUSÃO DE PEDIDO ===');
  
  // Get current user
  const { data: { user }, error: userError } = await window.supabase.auth.getUser();
  if (userError) {
    console.error('Erro ao obter usuário:', userError);
    return;
  }
  
  console.log('Usuário atual:', user?.id);
  
  // First, let's check if we can see orders
  const { data: orders, error: ordersError } = await window.supabase
    .from('orders')
    .select('*')
    .limit(5);
    
  if (ordersError) {
    console.error('Erro ao buscar pedidos:', ordersError);
    return;
  }
  
  console.log('Pedidos encontrados:', orders?.length);
  console.log('Primeiro pedido:', orders?.[0]);
  
  if (orders && orders.length > 0) {
    const orderId = orders[0].id;
    
    // Check order items first
    const { data: orderItems, error: itemsError } = await window.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    console.log('Items do pedido:', orderItems?.length);
    
    // Try to delete order items first
    console.log('Tentando excluir items do pedido...');
    const { data: deletedItems, error: deleteItemsError } = await window.supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
      
    if (deleteItemsError) {
      console.error('Erro ao excluir items:', deleteItemsError);
    } else {
      console.log('Items excluídos com sucesso:', deletedItems);
    }
    
    // Now try to delete the order
    console.log('Tentando excluir o pedido...');
    const { data: deletedOrder, error: deleteOrderError } = await window.supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
      
    if (deleteOrderError) {
      console.error('Erro ao excluir pedido:', deleteOrderError);
    } else {
      console.log('Pedido excluído com sucesso:', deletedOrder);
    }
    
    // Verify if order still exists
    console.log('Verificando se o pedido ainda existe...');
    const { data: checkOrder, error: checkError } = await window.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId);
      
    if (checkError) {
      console.error('Erro ao verificar pedido:', checkError);
    } else {
      console.log('Pedido ainda existe?', checkOrder?.length > 0);
    }
  }
}

// Execute the test
testOrderDeletion();
