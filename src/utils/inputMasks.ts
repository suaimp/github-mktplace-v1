// Utilitários para máscaras de input
export interface MaskUtils {
  formatCPF: (value: string) => string;
  formatCNPJ: (value: string) => string;
  formatCEP: (value: string) => string;
  formatPhone: (value: string) => string;
  formatEmail: (value: string) => string;
  removeMask: (value: string) => string;
  validateCPF: (cpf: string) => boolean;
  validateCNPJ: (cnpj: string) => boolean;
  validateCEP: (cep: string) => boolean;
  validatePhone: (phone: string) => boolean;
  validateEmail: (email: string) => boolean;
}

// Remove todos os caracteres não numéricos
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Formatar CPF: 000.000.000-00
export const formatCPF = (value: string): string => {
  const numbers = removeMask(value);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

// Formatar CNPJ: 00.000.000/0000-00
export const formatCNPJ = (value: string): string => {
  const numbers = removeMask(value);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

// Formatar CEP: 00000-000
export const formatCEP = (value: string): string => {
  const numbers = removeMask(value);
  
  if (numbers.length <= 5) return numbers;
  
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

// Formatar telefone: aceita DDI opcional
export const formatPhone = (value: string): string => {
  const numbers = removeMask(value);
  let ddi = "";
  let rest = numbers;
  // Se começar com 55 ou outro DDI (2 ou 3 dígitos)
  if (numbers.length > 11) {
    ddi = `+${numbers.slice(0, numbers.length - 11)} `;
    rest = numbers.slice(numbers.length - 11);
  }
  if (rest.length <= 2) return ddi + rest;
  if (rest.length <= 7) return `${ddi}(${rest.slice(0, 2)}) ${rest.slice(2)}`;
  if (rest.length <= 10) return `${ddi}(${rest.slice(0, 2)}) ${rest.slice(2, 6)}-${rest.slice(6)}`;
  // Para celular com 9 dígitos
  return `${ddi}(${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7, 11)}`;
};

// Formatar email: apenas lowercase e validação básica
export const formatEmail = (value: string): string => {
  return value.toLowerCase().trim();
};

// Validar CPF
export const validateCPF = (cpf: string): boolean => {
  const numbers = removeMask(cpf);
  
  // Deve ter exatamente 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;
  
  if (parseInt(numbers.charAt(9)) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;
  
  return parseInt(numbers.charAt(10)) === digit2;
};

// Validar CNPJ (apenas formato: 14 dígitos)
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = removeMask(cnpj);
  // Aceita qualquer sequência de 14 dígitos (sem validação de dígitos verificadores)
  return numbers.length === 14;
};

// Validar CEP
export const validateCEP = (cep: string): boolean => {
  const numbers = removeMask(cep);
  // Deve ter exatamente 8 dígitos
  return numbers.length === 8 && /^\d{8}$/.test(numbers);
};

// Validar telefone: aceita DDI (10 a 15 dígitos)
export const validatePhone = (phone: string): boolean => {
  const numbers = removeMask(phone);
  // Aceita 10 a 15 dígitos (com ou sem DDI)
  return numbers.length >= 10 && numbers.length <= 15;
};

// Validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verificar se o campo está completamente preenchido
export const isFieldComplete = (value: string, mask: string): boolean => {
  const numbers = removeMask(value);
  
  switch (mask) {
    case "cpf":
      return numbers.length === 11;
    case "cnpj":
      return numbers.length === 14;
    case "cep":
      return numbers.length === 8;
    case "phone":
      return numbers.length === 10 || numbers.length === 11;
    case "email":
      return validateEmail(value);
    case "document":
      return numbers.length === 11 || numbers.length === 14;
    default:
      return value.trim().length > 0;
  }
};

// Detectar tipo de documento e aplicar máscara correspondente
export const formatDocument = (value: string): string => {
  const numbers = removeMask(value);
  
  if (numbers.length <= 11) {
    return formatCPF(value);
  } else {
    return formatCNPJ(value);
  }
};

// Validar documento (CPF ou CNPJ)
export const validateDocument = (document: string): boolean => {
  const numbers = removeMask(document);
  // Aceita qualquer sequência de 11 (CPF) ou 14 (CNPJ) dígitos (sem validação de dígitos verificadores)
  return numbers.length === 11 || numbers.length === 14;
};
