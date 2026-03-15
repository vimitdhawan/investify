import { cn, formatCurrency, formatCurrencyCompact } from './utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should combine class names', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', 'visible');
      expect(result).toBe('base visible');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });
  });

  describe('formatCurrency', () => {
    it('should format number as Indian currency', () => {
      expect(formatCurrency(1000)).toBe('₹1,000.00');
    });

    it('should format large numbers with Indian numbering system', () => {
      expect(formatCurrency(100000)).toBe('₹1,00,000.00');
    });

    it('should handle null', () => {
      expect(formatCurrency(null)).toBe('');
    });

    it('should handle undefined', () => {
      expect(formatCurrency(undefined)).toBe('');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹0.00');
    });
  });

  describe('formatCurrencyCompact', () => {
    it('should format large numbers in compact notation', () => {
      const result = formatCurrencyCompact(1000000);
      expect(result).toMatch(/₹/); // Contains rupee symbol
      expect(result).toMatch(/10/); // Contains compact number
    });

    it('should handle null', () => {
      expect(formatCurrencyCompact(null)).toBe('');
    });

    it('should handle undefined', () => {
      expect(formatCurrencyCompact(undefined)).toBe('');
    });
  });
});
