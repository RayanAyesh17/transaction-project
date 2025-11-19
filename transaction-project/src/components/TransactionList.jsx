import { calculateTransactionTotal } from "../utils";

export default function TransactionList({ transaction, onBack, onClear, onComplete }) {
  
  const items = transaction.items || [];
  const total = calculateTransactionTotal(items);

  return (
    <div className="bg-[#121212] p-6 rounded-2xl shadow-lg flex flex-col gap-4 animate-fadeIn">
      
      {/* Back button */}
      <button 
        onClick={onBack} 
        className="text-gray-400 hover:text-white transition transform hover:scale-105"
      >
        ← Back
      </button>

      {/* Transaction title */}
      <h2 className="text-2xl font-bold text-white transition-colors">
        Transaction Summary
      </h2>

      {/* Items list */}
      <div className="bg-black/30 p-4 rounded-xl flex flex-col gap-3 max-h-60 overflow-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items selected.</p>
        ) : (
          items.map((item, i) => (
            <div 
              key={i} 
              className="flex justify-between text-gray-200 border-b border-gray-700 pb-2"
            >
              <span>{item.name} x{item.qty || 1}</span>
              <span>${Number(item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <p className="text-gray-300 font-medium transition-colors">
        Total Items: {items.length}
      </p>

      <p className="text-gray-300 font-medium transition-colors">
        Total Amount: <span className="text-white font-bold">${total.toFixed(2)}</span>
      </p>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          className="flex-1 px-4 py-2 text-white border border-gray-700 rounded-2xl hover:bg-gray-800 transition transform hover:scale-105"
          onClick={onClear}
        >
          Clear
        </button>
        <button
          className="flex-1 px-4 py-2 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] rounded-2xl hover:opacity-90 transition transform hover:scale-105"
          onClick={onComplete}
        >
          Complete
        </button>
      </div>

      {/* Payments count */}
      <div className="mt-2 text-gray-400 text-sm transition-colors">
        Payments recorded: {transaction.payments ? transaction.payments.length : 0}
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        `}
      </style>
    </div>
  );
}
