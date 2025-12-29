export default function Builder({ cart, setCart }) {
  const parts = {
    cpu: { name: "Ryzen 5 5600", price: 72000 },
    gpu: { name: "RTX 3060", price: 185000 },
    ram: { name: "16GB DDR4", price: 28000 },
    storage: { name: "1TB NVMe SSD", price: 35000 },
  };

  const total =
    parts.cpu.price +
    parts.gpu.price +
    parts.ram.price +
    parts.storage.price;

  const addBuild = () => {
    setCart([
      ...cart,
      { name: "Custom PC Build", price: total },
    ]);
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Custom PC Builder</h2>

      {Object.values(parts).map((p, i) => (
        <p key={i}>
          {p.name} – LKR {p.price.toLocaleString()}
        </p>
      ))}

      <p className="font-bold mt-4">
        Total: LKR {total.toLocaleString()}
      </p>

      <button
        className="bg-black text-white w-full mt-4 py-2 rounded"
        onClick={addBuild}
      >
        Add Build to Cart
      </button>
    </div>
  );
}

