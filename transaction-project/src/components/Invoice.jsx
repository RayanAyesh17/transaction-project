import { useMemo, useRef } from "react";
import { calculateTransactionTotal, calculateTotalPaid } from "../utils";

export default function Invoice({ transaction, onClose }) {
  const printableRef = useRef(null);

  const total = useMemo(
    () => calculateTransactionTotal(transaction.items || []),
    [transaction]
  );

  const totalItems = useMemo(
    () => (transaction.items || []).reduce((s, it) => s + Number(it.qty || 0), 0),
    [transaction]
  );

  const paid = useMemo(
    () => calculateTotalPaid(transaction.payments || []),
    [transaction]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div
          ref={printableRef}
          className="print-area bg-white text-black w-full max-w-2xl rounded-2xl p-6 shadow-lg overflow-y-auto max-h-[90vh]"
        >
          <button
            className="absolute top-6 right-6 text-gray-600 print:hidden"
            onClick={onClose}
          >
            ✕
          </button>

          <div className="mb-4 text-center">
            <h1 className="text-3xl font-bold text-[#7F00FF]">RECEIPT</h1>
            <p className="text-sm text-gray-600">
              {new Date(transaction.createdAt || Date.now()).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Transaction ID: {transaction.id}</p>
          </div>

          <div className="border p-4 rounded mb-4">
            <div className="flex justify-between mb-2">
              <div className="font-semibold">Items ({totalItems})</div>
              <div className="font-semibold">Total: ${total.toFixed(2)}</div>
            </div>

            <div className="mt-2 space-y-3">
              {(transaction.items || []).map((it) => {
                const itemTotal =
                  (Number(it.price) + (Number(it.price) * Number(it.feePercent || 0)) / 100) *
                  Number(it.qty || 1);

                return (
                  <div key={it.id} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{it.name} × {it.qty}</div>
                      <div className="text-gray-500">
                        ${Number(it.price).toFixed(2)} · Fee {Number(it.feePercent || 0)}%
                      </div>
                    </div>
                    <div className="font-medium">${itemTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border p-4 rounded mb-4">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="mt-3">
              <div className="font-semibold mb-2">Payments</div>

              {(!transaction.payments || transaction.payments.length === 0) && (
                <div className="text-gray-500">No payments recorded</div>
              )}

              {(transaction.payments || []).map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>{p.type.toUpperCase()}</div>
                  <div>
                    ${Number(p.amount).toFixed(2)}{" "}
                    {(p.type === "credit" || p.type === "debit") && (
                      <span className="text-gray-500">(2% fee applied)</span>
                    )}
                  </div>
                </div>
              ))}


              <div className="flex justify-between font-bold mt-3">
                <div>Total Paid</div>
                <div>${paid.toFixed(2)}</div>
              </div>

              <div className="flex justify-between font-bold mt-2">
                <div>Remaining</div>
                <div>${Math.max(total - paid, 0).toFixed(2)}</div>
              </div>

              <div className="flex justify-between font-bold mt-2">
                <div>Change</div>
                <div>${Math.max(paid - total, 0).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] rounded text-white"
            >
              Export / Print PDF
            </button>
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .print-area, .print-area * {
              visibility: visible !important;
            }
            .print-area {
              position: fixed;
              inset: 0;
              margin: 0;
              padding: 20px;
              box-shadow: none;
              border-radius: 0;
            }
            .print:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
}
