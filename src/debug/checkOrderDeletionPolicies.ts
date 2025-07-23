// Script para verificar e diagnosticar políticas de DELETE para orders
// Execute este script no console do navegador para verificar as políticas

import { supabase } from '../lib/supabase';

export const checkDeletePolicies = async () => {
  try {
    console.log("🔍 Verificando políticas de DELETE para orders...");
    
    // Verificar se existem políticas de DELETE para a tabela orders
    const { data: policiesData, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'orders')
      .eq('cmd', 'DELETE');
    
    if (policiesError) {
      console.error("❌ Erro ao verificar políticas:", policiesError);
      return;
    }
    
    console.log("📋 Políticas de DELETE encontradas para 'orders':", policiesData);
    
    if (policiesData.length === 0) {
      console.warn("⚠️ PROBLEMA ENCONTRADO: Não há políticas de DELETE para a tabela 'orders'!");
      console.log("📝 Isso explica por que a exclusão falha silenciosamente.");
      console.log("🔧 Solução: Execute a migração '20250722000000_add_orders_delete_policies.sql'");
    } else {
      console.log("✅ Políticas de DELETE encontradas!");
      policiesData.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.qual}`);
      });
    }
    
    // Verificar políticas para order_items também
    const { data: itemsPoliciesData, error: itemsPoliciesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'order_items')
      .eq('cmd', 'DELETE');
    
    if (itemsPoliciesError) {
      console.error("❌ Erro ao verificar políticas de order_items:", itemsPoliciesError);
      return;
    }
    
    console.log("📋 Políticas de DELETE encontradas para 'order_items':", itemsPoliciesData);
    
    if (itemsPoliciesData.length === 0) {
      console.warn("⚠️ PROBLEMA ENCONTRADO: Não há políticas de DELETE para a tabela 'order_items'!");
    } else {
      console.log("✅ Políticas de DELETE para order_items encontradas!");
      itemsPoliciesData.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.qual}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar políticas:", error);
  }
};

// Função para testar a exclusão de um pedido específico
export const testOrderDeletion = async (orderId: string) => {
  try {
    console.log(`🧪 Testando exclusão do pedido: ${orderId}`);
    
    // Primeiro, verificar se o pedido existe e se o usuário tem acesso
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error("❌ Erro ao buscar pedido:", orderError);
      return;
    }
    
    console.log("📦 Pedido encontrado:", orderData);
    
    // Verificar se o usuário atual é o dono do pedido
    const { data: { user } } = await supabase.auth.getUser();
    console.log("👤 Usuário atual:", user?.id);
    console.log("👤 Dono do pedido:", orderData.user_id);
    console.log("🔑 Usuário é dono do pedido:", user?.id === orderData.user_id);
    
    // Verificar se o usuário é admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    const isAdmin = !adminError && adminData;
    console.log("🔑 Usuário é admin:", isAdmin);
    
    // Tentar excluir os itens do pedido primeiro
    console.log("🗑️ Tentando excluir itens do pedido...");
    const { error: itemsDeleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
    
    if (itemsDeleteError) {
      console.error("❌ Erro ao excluir itens do pedido:", itemsDeleteError);
      console.error("❌ Detalhes do erro:", {
        message: itemsDeleteError.message,
        code: itemsDeleteError.code,
        details: itemsDeleteError.details,
        hint: itemsDeleteError.hint
      });
    } else {
      console.log("✅ Itens do pedido excluídos com sucesso!");
    }
    
    // Tentar excluir o pedido
    console.log("🗑️ Tentando excluir o pedido...");
    const { error: orderDeleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (orderDeleteError) {
      console.error("❌ Erro ao excluir pedido:", orderDeleteError);
      console.error("❌ Detalhes do erro:", {
        message: orderDeleteError.message,
        code: orderDeleteError.code,
        details: orderDeleteError.details,
        hint: orderDeleteError.hint
      });
    } else {
      console.log("✅ Pedido excluído com sucesso!");
    }
    
  } catch (error) {
    console.error("❌ Erro no teste de exclusão:", error);
  }
};

// Para usar no console:
// import { supabase } from './path/to/supabase'
// checkDeletePolicies()
// testOrderDeletion('order-id-here')
