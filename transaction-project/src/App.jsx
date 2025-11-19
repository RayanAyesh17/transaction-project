import { useEffect, useMemo, useState } from "react";
import POS from "./components/POS";
import AddTransactionModal from "./components/AddTransactionModal"; // used for adding inventory items
import TransactionList from "./components/TransactionList";
import PaymentModal from "./components/PaymentModal";
import Invoice from "./components/Invoice";
import {
  generateID,
  calculateTransactionTotal,
  calculateRemaining,
} from "./utils";

export default function App() {
  // inventory items (available to add to cart)
  const [itemsInventory, setItemsInventory] = useState(() => {
    try {
      const s = localStorage.getItem("itemsInventory");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // completed transactions (history)
  const [transactions, setTransactions] = useState(() => {
    try {
      const s = localStorage.getItem("transactions");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // current working cart/transaction (not yet saved to history until completed)
  const [currentCart, setCurrentCart] = useState(() => {
    try {
      const s = localStorage.getItem("currentCart");
      return s ? JSON.parse(s) : { id: generateID(), items: [], payments: [], completed: false };
    } catch {
      return { id: generateID(), items: [], payments: [], completed: false };
    }
  });

  // UI state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null); // set when invoice ready

  // derived values
  const currentTotal = useMemo(
    () => calculateTransactionTotal(currentCart.items || []),
    [currentCart]
  );
  const totalItemsCount = useMemo(
    () => (currentCart.items || []).reduce((s, i) => s + Number(i.qty || 0), 0),
    [currentCart]
  );

  // persist storage
  useEffect(() => {
    try {
      localStorage.setItem("itemsInventory", JSON.stringify(itemsInventory));
    } catch (e) { }
  }, [itemsInventory]);

  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (e) { }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem("currentCart", JSON.stringify(currentCart));
    } catch (e) { }
  }, [currentCart]);

  // Inventory management
  const handleAddInventoryItem = (item) => {
    // item: { name, price, feePercent }
    setItemsInventory((prev) => [...prev, { id: generateID(), ...item }]);
  };

  // Add item from inventory to current cart with qty (merge if same id)
  const addToCart = (inventoryItem, qty = 1) => {
    const id = inventoryItem.id;
    setCurrentCart((prev) => {
      const existingIndex = prev.items.findIndex((it) => it.id === id);
      if (existingIndex >= 0) {
        const cloned = { ...prev, items: prev.items.map((it) => it.id === id ? { ...it, qty: Number(it.qty || 0) + Number(qty) } : it) };
        return cloned;
      }
      const itemToAdd = {
        id,
        name: inventoryItem.name,
        price: Number(inventoryItem.price),
        feePercent: Number(inventoryItem.feePercent || 0),
        qty: Number(qty || 1),
      };
      return { ...prev, items: [...prev.items, itemToAdd] };
    });
  };

  const removeItemFromCart = (itemId) => {
    setCurrentCart((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== itemId) }));
  };

  const clearCart = () => {
    setCurrentCart({ id: generateID(), items: [], payments: [], completed: false });
  };

  const completeTransaction = () => {
    // show payment modal
    setShowPayment(true);
  };

  const savePaymentsAndComplete = (payments) => {
    // create a new transaction object and save to history
    const newTransaction = {
      id: generateID(),
      items: currentCart.items,
      payments,
      completed: calculateRemaining({ items: currentCart.items }, payments) <= 0,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setInvoiceData(newTransaction);
    // reset cart
    setCurrentCart({ id: generateID(), items: [], payments: [], completed: false });
    setShowPayment(false);
  };

  const openInvoiceFromHistory = (transaction) => {
    setInvoiceData(transaction);
  };

  const deleteTransaction = (transactionId) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-[#0D0D0D] to-[#1C0D2E] text-white">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
        {/* Left - Inventory */}
        <div className="col-span-12 lg:col-span-3 bg-[#1F1F1F] rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Items</h2>
          <button
            className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] rounded-lg"
            onClick={() => setShowAddItemModal(true)}
          >
            + Add Item
          </button>

          <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
            {itemsInventory.length === 0 && <p className="text-gray-400">No items yet — add some.</p>}
            {itemsInventory.map((it) => (
              <div key={it.id} className="bg-[#121212] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-gray-400">Price: ${Number(it.price).toFixed(2)} · Fee: {Number(it.feePercent || 0)}%</div>
                </div>
                <div>
                  <button
                    className="px-3 py-1 bg-purple-600 rounded-xl"
                    onClick={() => addToCart(it, 1)}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle - POS Table */}
        <div className="col-span-12 lg:col-span-6 bg-[#121212] rounded-2xl p-6 shadow">
          <POS
            inventory={itemsInventory}
            onAddToCart={addToCart}
            cart={currentCart}
            onRemoveFromCart={removeItemFromCart}
          />
        </div>

        {/* Right - Cart Summary & Transactions history */}
        <div className="col-span-12 lg:col-span-3 bg-[#1F1F1F] rounded-2xl p-6 shadow flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold">Current Cart</h3>
            <p className="text-sm text-gray-300">{totalItemsCount} item(s)</p>
            <div className="mt-3 bg-[#0E0E0E] p-3 rounded-lg">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">${currentTotal.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={clearCart}
                  className="flex-1 px-3 py-2 border rounded-xl text-white"
                >
                  Clear
                </button>
                <button
                  onClick={completeTransaction}
                  disabled={currentCart.items.length === 0}
                  className={`flex-1 px-3 py-2 rounded-xl text-white ${currentCart.items.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-[#7F00FF] to-[#E100FF]"}`}
                >
                  Complete
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold">History</h3>
            <div className="max-h-[40vh] overflow-auto mt-2 space-y-2">
              {transactions.length === 0 && <p className="text-gray-400">No transactions yet.</p>}
              {transactions.map((t) => (
                <div key={t.id} className="bg-[#0E0E0E] p-2 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">Transaction • {new Date(t.createdAt).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">{(t.items || []).reduce((s, i) => s + Number(i.qty || 0), 0)} items · ${calculateTransactionTotal(t.items).toFixed(2)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openInvoiceFromHistory(t)} className="px-2 py-1 bg-purple-600 rounded">View</button>
                    <button onClick={() => deleteTransaction(t.id)} className="px-2 py-1 bg-red-600 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <AddTransactionModal
          onClose={() => setShowAddItemModal(false)}
          onSave={(item) => {
            handleAddInventoryItem(item);
            setShowAddItemModal(false);
          }}
        />
      )}

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          transaction={{ items: currentCart.items }}
          onClose={() => setShowPayment(false)}
          onInvoice={(payments) => savePaymentsAndComplete(payments)}
        />

      )}

      {/* Invoice modal */}
      {invoiceData && (
        <Invoice
          transaction={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
}
