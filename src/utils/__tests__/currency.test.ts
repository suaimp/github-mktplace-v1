/**
 * Testes para funções utilitárias de moeda e formatação
 */

import { formatCurrency } from '../currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(100)).toBe('R$ 100,00');
      expect(formatCurrency(0.99)).toBe('R$ 0,99');
    });

    it('should handle zero values', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-100.50)).toBe('R$ -100,50');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000.99)).toBe('R$ 1.000.000,99');
    });

    it('should handle decimal precision', () => {
      expect(formatCurrency(10.999)).toBe('R$ 11,00'); // Arredondamento
      expect(formatCurrency(10.001)).toBe('R$ 10,00');
    });

    it('should handle edge cases', () => {
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
      expect(formatCurrency(Infinity)).toBe('R$ 0,00');
      expect(formatCurrency(-Infinity)).toBe('R$ 0,00');
    });
  });
});
