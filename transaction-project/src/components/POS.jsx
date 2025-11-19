import { useMemo, useState } from "react";
import { calculateTransactionTotal } from "../utils";

export default function POS({ inventory = [], onAddToCart, cart = { items: [] }, onRemoveFromCart }) {
  const [qtys, setQtys] = useState({});

  const handleQtyChange = (id, value) => {
    setQtys((p) => ({ ...p, [id]: Number(value) }));
  };

  const totalCart = useMemo(() => calculateTransactionTotal(cart.items || []), [cart]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">POS</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0F0F0F] p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Inventory</h3>
          <div className="space-y-3 max-h-[45vh] overflow-auto pr-2">
            {inventory.length === 0 && <p className="text-gray-400">No items in inventory.</p>}
            {inventory.map((it) => (
              <div key={it.id} className="flex items-center justify-between bg-[#121212] p-2 rounded">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-400">${Number(it.price).toFixed(2)} · {Number(it.feePercent || 0)}% fee</div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={qtys[it.id] || 1}
                    onChange={(e) => handleQtyChange(it.id, e.target.value)}
                    className="w-20 p-1 rounded bg-[#0B0B0B] text-white border border-gray-700"
                  />
                  <button
                    className="px-3 py-1 bg-purple-600 rounded"
                    onClick={() => onAddToCart(it, qtys[it.id] || 1)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0F0F0F] p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Cart</h3>

          {cart.items.length === 0 ? (
            <p className="text-gray-400">No items in cart.</p>
          ) : (
            <div className="space-y-2 max-h-[45vh] overflow-auto pr-2">
              {cart.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between bg-[#121212] p-2 rounded">
                  <div>
                    <div className="font-medium">{it.name} × {it.qty}</div>
                    <div className="text-sm text-gray-400">${Number(it.price).toFixed(2)}each · {Number(it.feePercent || 0)}%</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-semibold">${( (Number(it.price) + (Number(it.price) * Number(it.feePercent || 0) / 100)) * Number(it.qty) ).toFixed(2)}</div>
                    <button className="text-sm text-red-400 mt-1" onClick={() => onRemoveFromCart(it.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between text-gray-300">
              <span>Items total</span>
              <span className="font-bold">${totalCart.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
