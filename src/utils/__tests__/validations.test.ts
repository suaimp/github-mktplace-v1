/**
 * Testes para validações de formulário
 */

import { validateEmail, validateCPF, validateCNPJ, validatePhone } from '../inputMasks';

describe('Form Validations', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+label@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validateCPF', () => {
    it('should validate correct CPF format', () => {
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('11144477735')).toBe(true); // Sem formatação
    });

    it('should reject invalid CPF', () => {
      expect(validateCPF('')).toBe(false);
      expect(validateCPF('123.456.789-00')).toBe(false); // CPF inválido
      expect(validateCPF('111.111.111-11')).toBe(false); // Todos iguais
      expect(validateCPF('12345678901')).toBe(false); // 11 dígitos inválidos
    });

    it('should handle edge cases', () => {
      expect(validateCPF('000.000.000-00')).toBe(false);
      expect(validateCPF('abc.def.ghi-jk')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('should validate correct CNPJ format', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true); // Sem formatação
    });

    it('should reject invalid CNPJ', () => {
      expect(validateCNPJ('')).toBe(false);
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false); // Todos iguais
      expect(validateCNPJ('12.345.678/0001-00')).toBe(false); // CNPJ inválido
    });
  });

  describe('validatePhone', () => {
    it('should validate Brazilian phone formats', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('+55 11 99999-9999')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('(11) 9999-999')).toBe(false); // Muito curto
    });
  });
});
