/**
 * AmountCalculatorService Unit Tests
 * Tests all currency math used in TRX payment processing
 */

import { AmountCalculatorService } from '../pos/AmountCalculatorService';

describe('AmountCalculatorService', () => {
  let calc: AmountCalculatorService;

  beforeEach(() => {
    calc = new AmountCalculatorService();
  });

  // ─── calculateTax ─────────────────────────────────────────────────────────

  describe('calculateTax', () => {
    it('calculates 8.875% tax on $100.00 → $8.88 (rounds half-up)', () => {
      expect(calc.calculateTax(100, 0.08875)).toBe(8.88);
    });

    it('calculates 8.875% tax on $38.75 order', () => {
      // 38.75 * 0.08875 = 3.4390625 → rounds to 3.44
      expect(calc.calculateTax(38.75, 0.08875)).toBe(3.44);
    });

    it('returns 0 for zero tax rate', () => {
      expect(calc.calculateTax(100, 0)).toBe(0);
    });

    it('returns 0 for zero amount', () => {
      expect(calc.calculateTax(0, 0.08875)).toBe(0);
    });

    it('returns 0 for invalid tax rate > 1', () => {
      // taxRate is a decimal (0.09), not percentage (9)
      expect(calc.calculateTax(100, 1.5)).toBe(0);
    });

    it('returns 0 for negative amount', () => {
      expect(calc.calculateTax(-10, 0.09)).toBe(0);
    });

    it('handles small amounts correctly', () => {
      // $0.01 * 0.09 = 0.0009 → rounds to 0
      expect(calc.calculateTax(0.01, 0.09)).toBe(0);
    });
  });

  // ─── calculateTotal ───────────────────────────────────────────────────────

  describe('calculateTotal', () => {
    it('adds subtotal and tax correctly', () => {
      expect(calc.calculateTotal(38.75, 3.44)).toBe(42.19);
    });

    it('handles zero tax', () => {
      expect(calc.calculateTotal(50, 0)).toBe(50);
    });

    it('rounds to 2 decimal places', () => {
      // 33.33 + 33.34 = 66.67
      expect(calc.calculateTotal(33.33, 33.34)).toBe(66.67);
    });

    it('returns 0 for negative inputs', () => {
      expect(calc.calculateTotal(-10, 5)).toBe(0);
    });
  });

  // ─── validateAmount ───────────────────────────────────────────────────────

  describe('validateAmount', () => {
    it('accepts valid amount $38.75', () => {
      const result = calc.validateAmount(38.75);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts minimum amount $0.01', () => {
      expect(calc.validateAmount(0.01).isValid).toBe(true);
    });

    it('accepts maximum amount $999999.99', () => {
      expect(calc.validateAmount(999999.99).isValid).toBe(true);
    });

    it('rejects amount $0.00 (below minimum)', () => {
      const result = calc.validateAmount(0);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/at least/);
    });

    it('rejects amount $1000000.00 (above maximum)', () => {
      const result = calc.validateAmount(1000000);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/cannot exceed/);
    });

    it('rejects amount with 3 decimal places', () => {
      const result = calc.validateAmount(9.999);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/2 decimal/);
    });

    it('rejects NaN', () => {
      const result = calc.validateAmount(NaN);
      expect(result.isValid).toBe(false);
    });
  });

  // ─── formatCurrency ───────────────────────────────────────────────────────

  describe('formatCurrency', () => {
    it('formats $38.75 as "$38.75"', () => {
      expect(calc.formatCurrency(38.75)).toBe('$38.75');
    });

    it('formats $100 as "$100.00"', () => {
      expect(calc.formatCurrency(100)).toBe('$100.00');
    });

    it('formats $0.01 as "$0.01"', () => {
      expect(calc.formatCurrency(0.01)).toBe('$0.01');
    });

    it('returns "$0.00" for invalid (negative) amount', () => {
      expect(calc.formatCurrency(-5)).toBe('$0.00');
    });
  });

  // ─── parseAmountFromString ────────────────────────────────────────────────

  describe('parseAmountFromString', () => {
    it('parses "$38.75" → 38.75', () => {
      expect(calc.parseAmountFromString('$38.75')).toBe(38.75);
    });

    it('parses "1,234.56" → 1234.56', () => {
      expect(calc.parseAmountFromString('1,234.56')).toBe(1234.56);
    });

    it('parses "100" → 100', () => {
      expect(calc.parseAmountFromString('100')).toBe(100);
    });

    it('returns 0 for empty string', () => {
      expect(calc.parseAmountFromString('')).toBe(0);
    });

    it('returns 0 for non-numeric string', () => {
      expect(calc.parseAmountFromString('abc')).toBe(0);
    });
  });

  // ─── splitAmount ──────────────────────────────────────────────────────────

  describe('splitAmount', () => {
    it('splits $100 into 4 equal parts of $25.00 each', () => {
      const parts = calc.splitAmount(100, 4);
      expect(parts).toHaveLength(4);
      expect(parts.every(p => p === 25)).toBe(true);
    });

    it('distributes remainder when amount does not divide evenly', () => {
      // $10 / 3 = $3.33 x 2 + $3.34 x 1 = $10.00
      const parts = calc.splitAmount(10, 3);
      expect(parts).toHaveLength(3);
      const total = parts.reduce((s, p) => s + p, 0);
      expect(Math.round(total * 100)).toBe(Math.round(10 * 100));
    });

    it('splits $38.75 order between 2 guests', () => {
      const parts = calc.splitAmount(38.75, 2);
      expect(parts).toHaveLength(2);
      const total = parts.reduce((s, p) => Math.round((s + p) * 100) / 100, 0);
      expect(total).toBe(38.75);
    });

    it('returns empty array for 0 parts', () => {
      expect(calc.splitAmount(100, 0)).toHaveLength(0);
    });

    it('returns empty array for negative parts', () => {
      expect(calc.splitAmount(100, -1)).toHaveLength(0);
    });

    it('returns the full amount for 1 part', () => {
      const parts = calc.splitAmount(45.50, 1);
      expect(parts).toHaveLength(1);
      expect(parts[0]).toBe(45.50);
    });
  });

  // ─── calculatePercentage ──────────────────────────────────────────────────

  describe('calculatePercentage (tip calculations)', () => {
    it('calculates 15% tip on $38.75 → $5.81', () => {
      expect(calc.calculatePercentage(38.75, 15)).toBe(5.81);
    });

    it('calculates 18% tip on $50.00 → $9.00', () => {
      expect(calc.calculatePercentage(50, 18)).toBe(9.00);
    });

    it('calculates 20% tip on $100.00 → $20.00', () => {
      expect(calc.calculatePercentage(100, 20)).toBe(20.00);
    });

    it('calculates 25% tip on $80.00 → $20.00', () => {
      expect(calc.calculatePercentage(80, 25)).toBe(20.00);
    });

    it('returns 0 for 0% tip', () => {
      expect(calc.calculatePercentage(100, 0)).toBe(0);
    });

    it('returns 0 for percentage > 100', () => {
      expect(calc.calculatePercentage(100, 101)).toBe(0);
    });

    it('returns 0 for negative amount', () => {
      expect(calc.calculatePercentage(-50, 20)).toBe(0);
    });
  });
});
