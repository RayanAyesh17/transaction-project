// utils.js
export function generateID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 9);
}

export function calculateItemTotal(item) {
  // item: { price, feePercent, qty }
  const base = Number(item.price || 0);
  const qty = Number(item.qty || 1);
  const feePercent = Number(item.feePercent || 0);
  const totalForOne = base + (base * feePercent) / 100;
  return +(totalForOne * qty);
}

export function calculateTransactionTotal(items = []) {
  return items.reduce((s, it) => s + calculateItemTotal(it), 0);
}

export function paymentEffectiveAmount(payment) {
  // payment: { method: 'cash'|'credit'|'debit', amount }
  const amt = Number(payment.amount || 0);
  if (payment.method === "credit" || payment.method === "debit") {
    return +(amt * 1.02); // +2% on that piece
  }
  return +amt;
}

export function calculateTotalPaid(payments = []) {
  return payments.reduce((s, p) => s + paymentEffectiveAmount(p), 0);
}

export function calculateRemaining(transaction, payments = []) {
  const total = calculateTransactionTotal(transaction.items || []);
  const paid = calculateTotalPaid(payments);
  return +(total - paid);
}
