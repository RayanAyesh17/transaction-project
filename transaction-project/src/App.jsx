import { useEffect, useMemo, useState } from "react";
import POS from "./components/POS";
import AddTransactionModal from "./components/AddTransactionModal";
import TransactionList from "./components/TransactionList";
import PaymentModal from "./components/PaymentModal";
import Invoice from "./components/Invoice";
import {
  generateID,
  calculateTransactionTotal,
  calculateRemaining,
} from "./utils";

export default function App() {
  const [itemsInventory, setItemsInventory] = useState(() => {
    try {
      const s = localStorage.getItem("itemsInventory");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const s = localStorage.getItem("transactions");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const [currentCart, setCurrentCart] = useState(() => {
    try {
      const s = localStorage.getItem("currentCart");
      return s
        ? JSON.parse(s)
        : { id: generateID(), items: [], payments: [], completed: false };
    } catch {
      return { id: generateID(), items: [], payments: [], completed: false };
    }
  });

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [editItemModal, setEditItemModal] = useState(null);
  const [deleteItemModal, setDeleteItemModal] = useState(null);

  const currentTotal = useMemo(
    () => calculateTransactionTotal(currentCart.items || []),
    [currentCart]
  );
  const totalItemsCount = useMemo(
    () => (currentCart.items || []).reduce((s, i) => s + Number(i.qty || 0), 0),
    [currentCart]
  );

  useEffect(() => {
    try {
      localStorage.setItem("itemsInventory", JSON.stringify(itemsInventory));
    } catch (e) {}
  }, [itemsInventory]);

  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem("currentCart", JSON.stringify(currentCart));
    } catch (e) {}
  }, [currentCart]);

  const handleAddInventoryItem = (item) => {
    setItemsInventory((prev) => [...prev, { id: generateID(), ...item }]);
  };

  const addToCart = (inventoryItem, qty = 1) => {
    const id = inventoryItem.id;
    setCurrentCart((prev) => {
      const existingIndex = prev.items.findIndex((it) => it.id === id);
      if (existingIndex >= 0) {
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.id === id ? { ...it, qty: Number(it.qty || 0) + Number(qty) } : it
          ),
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id,
            name: inventoryItem.name,
            price: Number(inventoryItem.price),
            feePercent: Number(inventoryItem.feePercent || 0),
            qty: Number(qty || 1),
          },
        ],
      };
    });
  };

  const removeItemFromCart = (itemId) => {
    setCurrentCart((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== itemId),
    }));
  };

  const clearCart = () => {
    setCurrentCart({ id: generateID(), items: [], payments: [], completed: false });
  };

  const completeTransaction = () => {
    setShowPayment(true);
  };

  const savePaymentsAndComplete = (payments) => {
    const newTransaction = {
      id: generateID(),
      items: currentCart.items,
      payments,
      completed: calculateRemaining({ items: currentCart.items }, payments) <= 0,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setInvoiceData(newTransaction);
    setCurrentCart({ id: generateID(), items: [], payments: [], completed: false });
    setShowPayment(false);
  };

  const openInvoiceFromHistory = (transaction) => {
    setInvoiceData(transaction);
  };

  const deleteTransaction = (transactionId) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  };

  const deleteInventoryItem = (itemId) => {
    setItemsInventory((prev) => prev.filter((it) => it.id !== itemId));
  };

  const editInventoryItem = (itemId, updatedData) => {
    setItemsInventory((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ...updatedData } : it))
    );
  };

  const updateCartItem = (updatedItem) => {
    if (updatedItem.delete) {
      setCurrentCart((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it.id !== updatedItem.id),
      }));
    } else {
      setCurrentCart((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
      }));
    }
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
              <div
                key={it.id}
                className="bg-[#121212] p-3 rounded-lg flex items-center justify-between relative"
              >
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-gray-400">
                    Price: ${Number(it.price).toFixed(2)} · Fee: {Number(it.feePercent || 0)}%
                  </div>
                </div>

                {/* 3-dot menu */}
                <div className="relative">
                  <button
                    className="px-2 py-1 text-white"
                    onClick={() =>
                      setActiveActionMenu(activeActionMenu === it.id ? null : it.id)
                    }
                  >
                    ⋮
                  </button>

                  {activeActionMenu === it.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-[#1F1F1F] rounded shadow-lg z-10 flex flex-col">
                      <button
                        className="px-3 py-2 text-left hover:bg-[#2A2A2A]"
                        onClick={() => {
                          addToCart(it, 1);
                          setActiveActionMenu(null);
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="px-3 py-2 text-left hover:bg-[#2A2A2A]"
                        onClick={() => {
                          setEditItemModal(it);
                          setActiveActionMenu(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-2 text-left text-red-500 hover:bg-[#2A2A2A]"
                        onClick={() => {
                          setDeleteItemModal(it);
                          setActiveActionMenu(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
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
            onUpdateCartItem={updateCartItem} 
          />
        </div>

        {/* Right - Cart Summary & History */}
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
                  className={`flex-1 px-3 py-2 rounded-xl text-white ${
                    currentCart.items.length === 0
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#7F00FF] to-[#E100FF]"
                  }`}
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
                    <div className="text-sm text-gray-400">
                      {(t.items || []).reduce((s, i) => s + Number(i.qty || 0), 0)} items · ${calculateTransactionTotal(t.items).toFixed(2)}
                    </div>
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

      {/* Modals */}
      {showAddItemModal && (
        <AddTransactionModal
          onClose={() => setShowAddItemModal(false)}
          onSave={(item) => {
            handleAddInventoryItem(item);
            setShowAddItemModal(false);
          }}
        />
      )}

      {editItemModal && (
        <AddTransactionModal
          item={editItemModal}
          onClose={() => setEditItemModal(null)}
          onSave={(updatedItem) => {
            editInventoryItem(editItemModal.id, updatedItem);
            setEditItemModal(null);
          }}
        />
      )}

      {deleteItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#1F1F1F] rounded-2xl p-6 w-80 text-white flex flex-col gap-4">
            <h2 className="text-lg font-bold">Delete Item</h2>
            <p>Are you sure you want to delete <span className="font-semibold">{deleteItemModal.name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setDeleteItemModal(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded"
                onClick={() => {
                  deleteInventoryItem(deleteItemModal.id);
                  setDeleteItemModal(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal
          transaction={{ items: currentCart.items }}
          onClose={() => setShowPayment(false)}
          onInvoice={(payments) => savePaymentsAndComplete(payments)}
        />
      )}

      {invoiceData && (
        <Invoice
          transaction={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
}
