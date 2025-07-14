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

// Formatar telefone: (00) 00000-0000 ou (00) 0000-0000
export const formatPhone = (value: string): string => {
  const numbers = removeMask(value);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  
  // Para celular com 9 dígitos
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
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

// Validar CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = removeMask(cnpj);
  
  // Deve ter exatamente 14 dígitos
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers.charAt(12)) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers.charAt(13)) === digit2;
};

// Validar CEP
export const validateCEP = (cep: string): boolean => {
  const numbers = removeMask(cep);
  // Deve ter exatamente 8 dígitos
  return numbers.length === 8 && /^\d{8}$/.test(numbers);
};

// Validar telefone
export const validatePhone = (phone: string): boolean => {
  const numbers = removeMask(phone);
  // Deve ter exatamente 10 ou 11 dígitos (telefone fixo ou celular)
  return numbers.length === 10 || numbers.length === 11;
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
  
  if (numbers.length === 11) {
    return validateCPF(document);
  } else if (numbers.length === 14) {
    return validateCNPJ(document);
  }
  
  return false;
};
