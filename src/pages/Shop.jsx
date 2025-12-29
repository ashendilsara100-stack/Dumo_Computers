import { useEffect, useState } from "react";
import { getProducts } from "../firebase/products";

export default function Shop({ cart, setCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-xl font-bold">{p.name}</h3>
          <p className="text-gray-500">{p.category}</p>
          <p className="font-bold mt-2">
            LKR {Number(p.price).toLocaleString()}
          </p>
          <button
            className="bg-black text-white w-full mt-4 py-2 rounded"
            onClick={() => addToCart(p)}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

