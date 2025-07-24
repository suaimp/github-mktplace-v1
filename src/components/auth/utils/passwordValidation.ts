/**
 * Utilitários para validação de senha
 * Responsabilidade: Validar formato e força da senha conforme regras de negócio
 */

export const validatePassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;

  return (
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar &&
    hasMinLength
  );
};

export const validatePasswordInput = (password: string): { isValid: boolean; error?: string } => {
  if (!password?.trim()) {
    return { isValid: false, error: "Senha é obrigatória" };
  }

  if (!validatePassword(password)) {
    return { 
      isValid: false, 
      error: "A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais" 
    };
  }

  return { isValid: true };
};
