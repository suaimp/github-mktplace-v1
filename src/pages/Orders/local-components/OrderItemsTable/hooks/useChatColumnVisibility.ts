import { useMemo } from 'react';

/**
 * Hook para controlar a visibilidade da coluna de chat baseado no status do pagamento
 */
export const useChatColumnVisibility = (paymentStatus?: string) => {
  const shouldShowChatColumn = useMemo(() => {
    console.log('🔍 [useChatColumnVisibility] Verificando status do pagamento:', {
      paymentStatus,
      shouldHide: paymentStatus === 'pending',
      shouldShow: paymentStatus !== 'pending'
    });
    
    // Esconde a coluna de chat se o status for "pending"
    return paymentStatus !== 'pending';
  }, [paymentStatus]);

  return {
    shouldShowChatColumn
  };
};
