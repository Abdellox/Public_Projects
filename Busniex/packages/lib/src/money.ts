import type { CurrencyCode } from '@businex/types';

/** Round to sensible money precision to avoid float drift. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Sum line totals with money-safe rounding. */
export function sumMoney(values: number[]): number {
  return roundMoney(values.reduce((acc, v) => acc + v, 0));
}

export interface QuoteLineTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Compute subtotal, tax and grand total for a set of lines where
 * each line carries quantity, unitPrice and taxRate.
 */
export function computeLineTotals(
  lines: { quantity: number; unitPrice: number; taxRate?: number }[],
  currency: CurrencyCode,
): { subtotal: number; taxAmount: number; total: number; lines: { lineTotal: number }[] } {
  let subtotal = 0;
  let taxAmount = 0;
  const withTotals = lines.map((l) => {
    const lineTotal = roundMoney(l.quantity * l.unitPrice);
    const tax = roundMoney(lineTotal * (l.taxRate ?? 0));
    subtotal += lineTotal;
    taxAmount += tax;
    return { lineTotal };
  });
  return {
    subtotal: roundMoney(subtotal),
    taxAmount: roundMoney(taxAmount),
    total: roundMoney(subtotal + taxAmount),
    lines: withTotals,
  };
}
