import { useState } from "react";
import { addProduct } from "../firebase/products";

export default function Admin() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const save = async () => {
    await addProduct({
      name,
      price: Number(price),
      category,
    });
    alert("Product added");
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      <input
        placeholder="Product Name"
        className="border p-2 w-full mb-2"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Category"
        className="border p-2 w-full mb-2"
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        placeholder="Price"
        className="border p-2 w-full mb-2"
        onChange={(e) => setPrice(e.target.value)}
      />

      <button
        onClick={save}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Product
      </button>
    </div>
  );
}
