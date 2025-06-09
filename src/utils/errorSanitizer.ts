/**
 * Sanitiza mensagens de erro removendo informações sensíveis como chaves de API
 * @param errorMessage - A mensagem de erro original
 * @returns Mensagem de erro sanitizada
 */
export function sanitizeErrorMessage(errorMessage: string): string {
  if (!errorMessage || typeof errorMessage !== "string") {
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  // Lista de padrões que podem conter informações sensíveis
  const sensitivePatterns = [
    // Chaves do Stripe
    /pk_test_[a-zA-Z0-9_]+/g,
    /pk_live_[a-zA-Z0-9_]+/g,
    /sk_test_[a-zA-Z0-9_]+/g,
    /sk_live_[a-zA-Z0-9_]+/g,
    /whsec_[a-zA-Z0-9_]+/g,

    // Outras chaves de API comuns
    /api[_-]?key[s]?[\s]*[:=][\s]*[a-zA-Z0-9_-]+/gi,
    /secret[_-]?key[s]?[\s]*[:=][\s]*[a-zA-Z0-9_-]+/gi,
    /access[_-]?token[s]?[\s]*[:=][\s]*[a-zA-Z0-9_-]+/gi,

    // Tokens JWT
    /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,

    // URLs com tokens ou chaves
    /https?:\/\/[^\/]*\/[^?]*\?[^&]*(?:token|key|secret)[^&\s]*/gi
  ];

  let sanitizedMessage = errorMessage;

  // Remove informações sensíveis
  sensitivePatterns.forEach((pattern) => {
    sanitizedMessage = sanitizedMessage.replace(
      pattern,
      "[INFORMAÇÃO SENSÍVEL REMOVIDA]"
    );
  });

  // Mapeamento de mensagens de erro comuns do Stripe para mensagens mais amigáveis
  const errorMappings: Record<string, string> = {
    "Your card was declined.":
      "Seu cartão foi recusado. Verifique os dados ou tente outro cartão.",
    "Your card number is incorrect.": "O número do cartão está incorreto.",
    "Your card's expiration date is incorrect.":
      "A data de validade do cartão está incorreta.",
    "Your card's security code is incorrect.":
      "O código de segurança do cartão está incorreto.",
    "Your card has insufficient funds.":
      "Seu cartão não possui fundos suficientes.",
    "Your card does not support this type of purchase.":
      "Seu cartão não suporta este tipo de compra.",
    "Your card has been declined.": "Seu cartão foi recusado.",
    "Payment failed": "Falha no pagamento. Tente novamente.",
    "Invalid API Key provided":
      "Erro de configuração do sistema de pagamento. Contate o suporte.",
    "No such payment_intent": "Erro na transação. Tente novamente.",
    "This payment requires authentication":
      "Este pagamento requer autenticação adicional."
  };

  // Verifica se a mensagem corresponde a algum erro conhecido
  for (const [originalError, friendlyMessage] of Object.entries(
    errorMappings
  )) {
    if (sanitizedMessage.toLowerCase().includes(originalError.toLowerCase())) {
      return friendlyMessage;
    }
  }

  // Verifica padrões específicos de erros do Stripe
  if (
    sanitizedMessage.includes("test mode") &&
    sanitizedMessage.includes("live mode")
  ) {
    return "Erro de configuração: modo de teste/produção inconsistente. Contate o suporte.";
  }

  if (
    sanitizedMessage.includes("invalid api key") ||
    sanitizedMessage.includes("invalid key")
  ) {
    return "Erro de configuração do sistema de pagamento. Contate o suporte.";
  }

  if (sanitizedMessage.includes("card_declined")) {
    return "Seu cartão foi recusado. Verifique os dados ou tente outro cartão.";
  }

  if (sanitizedMessage.includes("insufficient_funds")) {
    return "Seu cartão não possui fundos suficientes.";
  }

  if (sanitizedMessage.includes("expired_card")) {
    return "Seu cartão está vencido.";
  }

  if (sanitizedMessage.includes("incorrect_cvc")) {
    return "O código de segurança do cartão está incorreto.";
  }

  if (sanitizedMessage.includes("incorrect_number")) {
    return "O número do cartão está incorreto.";
  }

  if (sanitizedMessage.includes("processing_error")) {
    return "Erro no processamento do pagamento. Tente novamente.";
  }

  // Se a mensagem contém informações que parecem técnicas demais, usar uma mensagem genérica
  const technicalTerms = [
    "payment_intent",
    "client_secret",
    "stripe",
    "webhook",
    "endpoint",
    "authentication failed",
    "unauthorized",
    "401",
    "403",
    "500",
    "internal server error"
  ];

  const containsTechnicalTerms = technicalTerms.some((term) =>
    sanitizedMessage.toLowerCase().includes(term.toLowerCase())
  );

  if (containsTechnicalTerms) {
    return "Erro no processamento do pagamento. Tente novamente ou contate o suporte.";
  }

  // Remove URLs completas que podem conter informações sensíveis
  sanitizedMessage = sanitizedMessage.replace(
    /https?:\/\/[^\s]+/g,
    "[URL removida por segurança]"
  );

  // Se a mensagem ficou muito curta ou vazia após sanitização, usar mensagem padrão
  if (sanitizedMessage.trim().length < 10) {
    return "Ocorreu um erro no pagamento. Tente novamente.";
  }

  return sanitizedMessage;
}

/**
 * Função específica para sanitizar erros do Stripe
 * @param stripeError - Erro do Stripe
 * @returns Mensagem de erro sanitizada e amigável
 */
export function sanitizeStripeError(stripeError: any): string {
  if (!stripeError) {
    return "Erro desconhecido no pagamento.";
  }

  // Se é um objeto de erro do Stripe, extrair a mensagem
  const message =
    typeof stripeError === "string"
      ? stripeError
      : stripeError.message || stripeError.toString();

  return sanitizeErrorMessage(message);
}
