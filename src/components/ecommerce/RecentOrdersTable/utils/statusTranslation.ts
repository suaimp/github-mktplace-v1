/**
 * Utilitário para traduzir status de pedidos para português
 */

export const getTranslatedStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pendente',
    'processing': 'Processando',
    'approved': 'Aprovado',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'failed': 'Falhou',
    'paid': 'Pago',
    'refunded': 'Reembolsado',
    'rejected': 'Rejeitado',
    'shipped': 'Enviado',
    'delivered': 'Entregue',
    'draft': 'Rascunho',
    'active': 'Ativo',
    'inactive': 'Inativo',
    'expired': 'Expirado',
    'paused': 'Pausado'
  };
  
  return statusMap[status.toLowerCase()] || status;
};
