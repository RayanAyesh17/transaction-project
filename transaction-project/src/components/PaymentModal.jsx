import { useState, useEffect } from "react";
import { paymentEffectiveAmount, calculateRemaining } from "../utils";

export default function PaymentModal({ transaction, onClose, onInvoice }) {
  const [cash, setCash] = useState("");
  const [credit, setCredit] = useState("");
  const [debit, setDebit] = useState("");
  const [payments, setPayments] = useState(transaction.payments ? [...transaction.payments] : []);
  const [remaining, setRemaining] = useState(() => calculateRemaining(transaction, payments));

  const calcRemaining = (pList) => calculateRemaining(transaction, pList);

  useEffect(() => {
    setRemaining(calcRemaining(payments));
  }, [payments, transaction]);

  const addEntry = (type, value) => {
    const amt = parseFloat(value);
    if (!Number.isFinite(amt) || amt <= 0) return;
    setPayments((prev) => [...prev, { type, amount: amt, date: Date.now() }]);
    if (type === "cash") setCash("");
    if (type === "credit") setCredit("");
    if (type === "debit") setDebit("");
  };

  const canComplete = payments.length > 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
        {/* Modal */}
        <div className="bg-[#1F1F1F] w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-4 animate-scaleFade">

          <h2 className="text-2xl font-bold text-white">{transaction.name} Payment</h2>

          <div className="flex flex-col gap-3">
            {["cash", "credit", "debit"].map((type) => {
              const value = type === "cash" ? cash : type === "credit" ? credit : debit;
              const label = type.charAt(0).toUpperCase() + type.slice(1) + (type !== "cash" ? " (+2%)" : "");
              return (
                <div key={type}>
                  <label className="block text-gray-300 mb-1">{label}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) => type === "cash" ? setCash(e.target.value) : type === "credit" ? setCredit(e.target.value) : setDebit(e.target.value)}
                      placeholder={`Enter ${type}`}
                      className="flex-1 p-3 rounded-lg border border-gray-700 bg-[#121212] text-white focus:outline-none focus:border-purple-500 transition"
                    />
                    <button
                      onClick={() => addEntry(type, value)}
                      className="px-4 py-2 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] rounded-lg text-white hover:scale-105 transition-transform duration-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#121212] p-3 rounded-lg overflow-hidden">
            <p className="text-gray-300 font-medium mb-1">Payment Breakdown:</p>
            {payments.length > 0 ? (
              payments.map((p, i) => (
                <div key={i} className="flex justify-between text-white text-sm py-1 transform transition duration-300 hover:translate-x-1">
                  <div>{p.type} • {Number(p.amount).toFixed(2)}</div>
                  <div className="text-gray-300">{Number(paymentEffectiveAmount(p)).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No payments added yet</p>
            )}
          </div>

          <p className={`font-bold text-lg ${remaining > 0 ? "text-yellow-400" : "text-green-500"} transition-colors duration-300`}>
            Remaining Amount: ${remaining > 0 ? remaining : 0}
          </p>

          <div className="flex justify-end gap-4 mt-4">
            <button className="px-5 py-3 text-white border border-gray-700 rounded-2xl hover:bg-gray-800 transition transform hover:scale-105" onClick={onClose}>Back</button>
            <button
              className={`px-5 py-3 rounded-2xl text-white transition transform duration-200 ${canComplete ? "bg-gradient-to-r from-[#7F00FF] to-[#E100FF] hover:opacity-90 hover:scale-105" : "bg-gray-600 cursor-not-allowed"}`}
              disabled={!canComplete}
              onClick={() => onInvoice(payments)}
            >
              Save Payments
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind CDN Animations */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

          @keyframes scaleFade {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-scaleFade { animation: scaleFade 0.4s ease-out forwards; }
        `}
      </style>
    </>
  );
}
