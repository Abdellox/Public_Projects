import { describe, expect, it } from 'vitest';
import { roundMoney, sumMoney, computeLineTotals } from './money';

describe('money helpers', () => {
  it('rounds to two decimal places', () => {
    expect(roundMoney(19.999)).toBe(20);
    expect(roundMoney(10.005)).toBe(10.01);
  });

  it('sums without float drift', () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
  });

  it('computes line totals with tax', () => {
    const result = computeLineTotals(
      [
        { quantity: 2, unitPrice: 10, taxRate: 0.2 },
        { quantity: 1, unitPrice: 5, taxRate: 0.1 },
      ],
      'USD',
    );
    expect(result.subtotal).toBe(25);
    expect(result.taxAmount).toBe(4.5);
    expect(result.total).toBe(29.5);
  });
});
