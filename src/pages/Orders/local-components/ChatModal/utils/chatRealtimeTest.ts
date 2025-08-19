/**
 * Utilitário para testar realtime do chat
 * Use este arquivo para debuggar problemas de tempo real
 */

import { supabase } from '../../../../../lib/supabase';

export class ChatRealtimeTest {
  /**
   * Testa se o realtime está funcionando
   */
  static async testRealtimeConnection(orderItemId: string): Promise<boolean> {
    console.log('🧪 [Test] Iniciando teste de realtime...');
    
    return new Promise((resolve) => {
      let received = false;
      let timeoutId: NodeJS.Timeout;

      const channel = supabase
        .channel(`test_order_chat_${orderItemId}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'order_chat',
            filter: `order_item_id=eq.${orderItemId}`,
          },
          (payload) => {
            console.log('🧪 [Test] Recebido via realtime:', payload);
            received = true;
            clearTimeout(timeoutId);
            supabase.removeChannel(channel);
            resolve(true);
          }
        )
        .subscribe((status) => {
          console.log('🧪 [Test] Status subscription:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('🧪 [Test] Subscription ativa, inserindo mensagem de teste...');
            
            // Inserir mensagem de teste após 1 segundo
            setTimeout(async () => {
              try {
                const { data: user } = await supabase.auth.getUser();
                if (!user?.user) {
                  console.error('🧪 [Test] Usuário não autenticado');
                  resolve(false);
                  return;
                }

                const { error } = await supabase
                  .from('order_chat')
                  .insert({
                    order_id: 'test-order',
                    order_item_id: orderItemId,
                    entry_id: 'test-entry',
                    sender_id: user.user.id,
                    sender_type: 'user',
                    message: `Teste realtime ${new Date().toISOString()}`
                  });

                if (error) {
                  console.error('🧪 [Test] Erro ao inserir:', error);
                  resolve(false);
                }
              } catch (err) {
                console.error('🧪 [Test] Erro geral:', err);
                resolve(false);
              }
            }, 1000);

            // Timeout de 10 segundos
            timeoutId = setTimeout(() => {
              if (!received) {
                console.log('🧪 [Test] Timeout - realtime não funcionou');
                supabase.removeChannel(channel);
                resolve(false);
              }
            }, 10000);
          }
        });
    });
  }

  /**
   * Verifica se realtime está habilitado no Supabase
   */
  static async checkRealtimeStatus(): Promise<boolean> {
    try {
      console.log('🧪 [Test] Verificando status do realtime...');
      
      const channel = supabase.channel('test-connection');
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          supabase.removeChannel(channel);
          resolve(false);
        }, 5000);

        channel.subscribe((status) => {
          clearTimeout(timeout);
          console.log('🧪 [Test] Status realtime:', status);
          supabase.removeChannel(channel);
          resolve(status === 'SUBSCRIBED');
        });
      });
    } catch (err) {
      console.error('🧪 [Test] Erro ao verificar realtime:', err);
      return false;
    }
  }

  /**
   * Lista todos os canais ativos
   */
  static listActiveChannels(): any[] {
    const channels = (supabase as any).getChannels?.() || [];
    console.log('🧪 [Test] Canais ativos:', channels);
    return channels;
  }

  /**
   * Limpa todos os canais
   */
  static cleanupAllChannels(): void {
    console.log('🧪 [Test] Limpando todos os canais...');
    const channels = this.listActiveChannels();
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    console.log('🧪 [Test] Canais limpos');
  }
}

// Função global para facilitar debug no console
(window as any).testChatRealtime = ChatRealtimeTest;
