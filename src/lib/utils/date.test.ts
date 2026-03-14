import { formatDateToYYYYMMDD, parseDDMMYYYYString, parseYYYYMMDDString } from './date';

describe('Date Utils', () => {
  describe('formatDateToYYYYMMDD', () => {
    it('should format date with double digit day and month', () => {
      const date = new Date(2023, 5, 15); // June 15, 2023
      expect(formatDateToYYYYMMDD(date)).toBe('2023-06-15');
    });

    it('should format date with single digit day and month', () => {
      const date = new Date(2023, 0, 5); // January 5, 2023
      expect(formatDateToYYYYMMDD(date)).toBe('2023-01-05');
    });

    it('should handle end of year', () => {
      const date = new Date(2023, 11, 31); // December 31, 2023
      expect(formatDateToYYYYMMDD(date)).toBe('2023-12-31');
    });
  });

  describe('parseDDMMYYYYString', () => {
    it('should parse DD-MM-YYYY string correctly', () => {
      const result = parseDDMMYYYYString('15-06-2023');
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('should parse date with single digits', () => {
      const result = parseDDMMYYYYString('01-01-2023');
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });
  });

  describe('parseYYYYMMDDString', () => {
    it('should parse YYYY-MM-DD string correctly', () => {
      const result = parseYYYYMMDDString('2023-06-15');
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getDate()).toBe(15);
    });
  });
});
