import { useEffect, useState } from "react";

export default function AddTransactionModal({ onClose, onSave, itemToEdit }) {
  const [name, setName] = useState(itemToEdit ? itemToEdit.name : "");
  const [price, setPrice] = useState(itemToEdit ? itemToEdit.price : "");
  const [feePercent, setFeePercent] = useState(itemToEdit ? itemToEdit.feePercent : 0);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || "");
      setPrice(itemToEdit.price || "");
      setFeePercent(itemToEdit.feePercent || 0);
    } else {
      setName("");
      setPrice("");
      setFeePercent(0);
    }
  }, [itemToEdit]);

  const handleSave = () => {
    if (!name || !price) return;
    onSave({
      name: name.trim(),
      price: Number(price),
      feePercent: Number(feePercent || 0),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1F1F1F] w-full max-w-md p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">{itemToEdit ? "Edit Item" : "Add Item"}</h2>

        <input
          className="w-full mb-3 p-3 rounded-lg bg-[#121212] text-white border border-gray-700"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full mb-3 p-3 rounded-lg bg-[#121212] text-white border border-gray-700"
          placeholder="Price (e.g. 12.50)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="w-full mb-3 p-3 rounded-lg bg-[#121212] text-white border border-gray-700"
          placeholder="Fee % (optional)"
          type="number"
          value={feePercent}
          onChange={(e) => setFeePercent(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-2">
          <button className="px-4 py-2 border rounded text-white" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] rounded text-white"
            onClick={handleSave}
          >
            {itemToEdit ? "Save" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
