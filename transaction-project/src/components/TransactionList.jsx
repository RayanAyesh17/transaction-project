import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";
import { calculateTransactionTotal } from "../utils";

export default function TransactionList({ transaction, onBack, onClear, onComplete, onUpdateItem }) {
  const [editItem, setEditItem] = useState(null);
  const items = transaction.items || [];
  const total = calculateTransactionTotal(items);

  const handleSaveEdit = (updatedItem) => {
    onUpdateItem(updatedItem); 
    setEditItem(null);
  };

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
          items.map((item) => (
            <div 
              key={item.id} 
              className="flex justify-between items-center text-gray-200 border-b border-gray-700 pb-2"
            >
              <div>
                <span>{item.name} x{item.qty || 1}</span>
                <span className="ml-2">${Number(item.price).toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-purple-600 rounded text-xs"
                  onClick={() => setEditItem(item)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-600 rounded text-xs"
                  onClick={() => onUpdateItem({ ...item, delete: true })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <p className="text-gray-300 font-medium transition-colors">
        Total Items: {items.reduce((s, i) => s + Number(i.qty || 0), 0)}
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

      {/* Edit Item Modal */}
      {editItem && (
        <AddTransactionModal
          itemToEdit={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
        />
      )}

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
