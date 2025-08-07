/**
 * Tradutor de erros específicos para PagarMe
 * Responsabilidade: Traduzir códigos de erro e mensagens do PagarMe para português amigável
 */

export interface PagarmeError {
  message: string;
  errors?: Record<string, string[]>;
  gateway_response?: {
    code: string;
    errors: Array<{ message: string }>;
  };
}

export interface TranslatedError {
  message: string;
  type: 'validation' | 'card' | 'system' | 'unknown';
  originalMessage?: string;
}

/**
 * Mapeamento de códigos de erro HTTP do PagarMe
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Erro de autenticação. Configuração do sistema inválida.',
  403: 'Acesso negado. Entre em contato com o suporte.',
  404: 'Recurso não encontrado.',
  412: 'Parâmetros válidos mas a requisição falhou. Tente novamente.',
  422: 'Dados inválidos. Verifique as informações do cartão e tente novamente.',
  429: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente em alguns minutos.'
};

/**
 * Mapeamento de mensagens específicas do PagarMe
 */
const PAGARME_ERROR_MESSAGES: Record<string, TranslatedError> = {
  // Mensagem principal que deve ser traduzida
  'The request is invalid': {
    message: 'Os dados do cartão estão incorretos. Verifique todas as informações e tente novamente.',
    type: 'card'
  },
  
  // Erros de cliente
  'Customer not found': {
    message: 'Cliente não encontrado. Tente novamente.',
    type: 'system'
  },
  
  // Erros de cartão
  'The number field is not a valid card number': {
    message: 'Número do cartão inválido. Verifique e tente novamente.',
    type: 'card'
  },
  
  'The field number must be a string with a minimum length of 13 and a maximum length of 19': {
    message: 'Número do cartão deve ter entre 13 e 19 dígitos.',
    type: 'card'
  },
  
  'The name field is required': {
    message: 'Nome do portador do cartão é obrigatório.',
    type: 'validation'
  },
  
  'The items field is required': {
    message: 'Itens do pedido são obrigatórios.',
    type: 'validation'
  },
  
  // Erros específicos de PSP
  'At least one customer phone is required': {
    message: 'Telefone do cliente é obrigatório.',
    type: 'validation'
  },

  // Erros de cartão comuns
  'card_declined': {
    message: 'Cartão recusado. Verifique os dados ou tente outro cartão.',
    type: 'card'
  },
  
  'insufficient_funds': {
    message: 'Saldo insuficiente no cartão.',
    type: 'card'
  },
  
  'expired_card': {
    message: 'Cartão vencido. Use um cartão válido.',
    type: 'card'
  },
  
  'incorrect_cvc': {
    message: 'Código de segurança (CVV) incorreto.',
    type: 'card'
  },
  
  'incorrect_number': {
    message: 'Número do cartão incorreto.',
    type: 'card'
  },

  'invalid_expiry_date': {
    message: 'Data de validade inválida.',
    type: 'card'
  },

  'processing_error': {
    message: 'Erro no processamento. Tente novamente em alguns minutos.',
    type: 'system'
  },

  'issuer_unavailable': {
    message: 'Banco emissor indisponível. Tente novamente mais tarde.',
    type: 'system'
  },

  'authentication_failed': {
    message: 'Falha na autenticação do cartão. Verifique os dados.',
    type: 'card'
  },

  'limit_exceeded': {
    message: 'Limite do cartão excedido.',
    type: 'card'
  },

  'restricted_card': {
    message: 'Cartão com restrição para compras online.',
    type: 'card'
  },

  'invalid_merchant': {
    message: 'Erro na configuração do comerciante. Entre em contato com o suporte.',
    type: 'system'
  }
};

/**
 * Mapeamento de erros por campo específico
 */
const FIELD_ERROR_MESSAGES: Record<string, string> = {
  'order.customer.name': 'Nome do cliente é obrigatório.',
  'order.customer.email': 'E-mail do cliente é obrigatório.',
  'order.customer.document': 'CPF/CNPJ é obrigatório.',
  'order.payments[0].credit_card.card.number': 'Número do cartão é obrigatório.',
  'order.payments[0].credit_card.card.exp_month': 'Mês de validade é obrigatório.',
  'order.payments[0].credit_card.card.exp_year': 'Ano de validade é obrigatório.',
  'order.payments[0].credit_card.card.cvv': 'Código de segurança (CVV) é obrigatório.',
  'order.payments[0].credit_card.card.holder_name': 'Nome no cartão é obrigatório.',
  'card.number': 'Número do cartão inválido.',
  'card.exp_month': 'Mês de validade inválido.',
  'card.exp_year': 'Ano de validade inválido.',
  'card.cvv': 'Código de segurança inválido.',
  'card.holder_name': 'Nome no cartão é obrigatório.',
  'order.items': 'Itens do pedido são obrigatórios.',
  'billing_address.line_1': 'Endereço de cobrança é obrigatório.',
  'billing_address.zip_code': 'CEP é obrigatório.',
  'billing_address.city': 'Cidade é obrigatória.',
  'billing_address.state': 'Estado é obrigatório.',
  'billing_address.country': 'País é obrigatório.',
  'customer.phones': 'Telefone é obrigatório.'
};

/**
 * Traduz erros do PagarMe para mensagens amigáveis em português
 */
export function translatePagarmeError(error: any): TranslatedError {
  // Se não há erro, retorna mensagem genérica
  if (!error) {
    return {
      message: 'Erro desconhecido. Tente novamente.',
      type: 'unknown'
    };
  }

  const originalMessage = typeof error === 'string' ? error : error.message || '';

  // 1. Verificar se é um erro HTTP conhecido
  if (error.status && HTTP_STATUS_MESSAGES[error.status]) {
    return {
      message: HTTP_STATUS_MESSAGES[error.status],
      type: error.status === 422 ? 'validation' : 'system',
      originalMessage
    };
  }

  // 2. Verificar mensagens principais conhecidas
  for (const [errorKey, translation] of Object.entries(PAGARME_ERROR_MESSAGES)) {
    if (originalMessage.toLowerCase().includes(errorKey.toLowerCase())) {
      return {
        ...translation,
        originalMessage
      };
    }
  }

  // 3. Verificar erros por campo específico
  if (error.errors && typeof error.errors === 'object') {
    const fieldErrors: string[] = [];
    
    for (const [fieldPath, messages] of Object.entries(error.errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        const fieldMessage = FIELD_ERROR_MESSAGES[fieldPath];
        if (fieldMessage) {
          fieldErrors.push(fieldMessage);
        } else {
          // Traduzir mensagem genérica do campo
          fieldErrors.push(translateFieldMessage(fieldPath, messages[0]));
        }
      }
    }

    if (fieldErrors.length > 0) {
      return {
        message: fieldErrors.join(' '),
        type: 'validation',
        originalMessage
      };
    }
  }

  // 4. Verificar gateway_response
  if (error.gateway_response?.errors && Array.isArray(error.gateway_response.errors)) {
    const gatewayErrors = error.gateway_response.errors
      .map(err => err.message)
      .map(msg => translateGatewayMessage(msg))
      .join(' ');

    if (gatewayErrors) {
      return {
        message: gatewayErrors,
        type: 'card',
        originalMessage
      };
    }
  }

  // 5. Verificar padrões conhecidos na mensagem
  const patterns = [
    { pattern: /card.*decline/i, message: 'Cartão recusado. Verifique os dados ou use outro cartão.', type: 'card' as const },
    { pattern: /invalid.*card/i, message: 'Dados do cartão inválidos.', type: 'card' as const },
    { pattern: /expired/i, message: 'Cartão vencido.', type: 'card' as const },
    { pattern: /insufficient.*fund/i, message: 'Saldo insuficiente.', type: 'card' as const },
    { pattern: /cvv.*invalid/i, message: 'Código de segurança inválido.', type: 'card' as const },
    { pattern: /authentication.*fail/i, message: 'Falha na autenticação. Verifique os dados do cartão.', type: 'card' as const },
    { pattern: /timeout/i, message: 'Tempo limite excedido. Tente novamente.', type: 'system' as const },
    { pattern: /network.*error/i, message: 'Erro de rede. Verifique sua conexão.', type: 'system' as const },
    { pattern: /internal.*error/i, message: 'Erro interno. Tente novamente em alguns minutos.', type: 'system' as const }
  ];

  for (const { pattern, message, type } of patterns) {
    if (pattern.test(originalMessage)) {
      return { message, type, originalMessage };
    }
  }

  // 6. Mensagem padrão para casos não tratados
  return {
    message: 'Erro no processamento do pagamento. Verifique os dados do cartão e tente novamente.',
    type: 'unknown',
    originalMessage
  };
}

/**
 * Traduz mensagens específicas de campos
 */
function translateFieldMessage(fieldPath: string, message: string): string {
  // Extrair nome do campo da path
  const fieldName = fieldPath.split('.').pop() || fieldPath;
  
  const fieldTranslations: Record<string, string> = {
    'name': 'nome',
    'email': 'e-mail',
    'number': 'número do cartão',
    'exp_month': 'mês de validade',
    'exp_year': 'ano de validade',
    'cvv': 'código de segurança',
    'holder_name': 'nome no cartão',
    'document': 'CPF/CNPJ',
    'phone': 'telefone',
    'address': 'endereço',
    'zip_code': 'CEP',
    'city': 'cidade',
    'state': 'estado',
    'country': 'país'
  };

  const translatedField = fieldTranslations[fieldName] || fieldName;

  if (message.includes('required')) {
    return `Campo ${translatedField} é obrigatório.`;
  }
  
  if (message.includes('invalid')) {
    return `Campo ${translatedField} é inválido.`;
  }

  return `Erro no campo ${translatedField}.`;
}

/**
 * Traduz mensagens do gateway
 */
function translateGatewayMessage(message: string): string {
  const gatewayTranslations: Record<string, string> = {
    'At least one customer phone is required': 'Telefone é obrigatório.',
    'Card declined': 'Cartão recusado.',
    'Insufficient funds': 'Saldo insuficiente.',
    'Invalid card number': 'Número do cartão inválido.',
    'Invalid expiration date': 'Data de validade inválida.',
    'Invalid security code': 'Código de segurança inválido.',
    'Expired card': 'Cartão vencido.',
    'Card not supported': 'Cartão não suportado para este tipo de transação.'
  };

  return gatewayTranslations[message] || message;
}

/**
 * Função principal para uso externo
 */
export function sanitizePagarmeError(error: any): string {
  const translated = translatePagarmeError(error);
  return translated.message;
}

/**
 * Função para obter tipo de erro (útil para tratamentos específicos na UI)
 */
export function getPagarmeErrorType(error: any): 'validation' | 'card' | 'system' | 'unknown' {
  const translated = translatePagarmeError(error);
  return translated.type;
}
