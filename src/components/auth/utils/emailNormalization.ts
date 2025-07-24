/**
 * Utilitários para normalização de email
 * Responsabilidade: Padronizar formato de emails para evitar problemas de case-sensitivity
 */

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateEmailInput = (email: string): { isValid: boolean; error?: string } => {
  if (!email?.trim()) {
    return { isValid: false, error: "Email é obrigatório" };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: "Email inválido" };
  }

  return { isValid: true };
};
