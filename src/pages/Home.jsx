// FULL PC E-COMMERCE WEBSITE (DEPLOY-READY SINGLE FILE DEMO)
// Stack: React + Tailwind + shadcn/ui

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Cpu, HardDrive, MemoryStick, Monitor } from "lucide-react";

// ------------------ DATA ------------------
const products = [
  { id: 1, name: "Gaming PC Ryzen 5 + RTX 3060", price: 485000, category: "Full PC" },
  { id: 2, name: "Office PC Intel i5", price: 325000, category: "Full PC" },
  { id: 3, name: "RTX 3060 12GB", price: 185000, category: "GPU" },
  { id: 4, name: "Ryzen 5 5600", price: 72000, category: "CPU" },
  { id: 5, name: "16GB DDR4 RAM", price: 28000, category: "RAM" },
  { id: 6, name: "1TB NVMe SSD", price: 35000, category: "Storage" },
];

// ------------------ APP ------------------
export default function PCHubLK() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [builder, setBuilder] = useState({ cpu: null, gpu: null, ram: null, storage: null });

  const addToCart = (item) => setCart([...cart, item]);
  const total = cart.reduce((s, i) => s + i.price, 0);

  const whatsappOrder = () => {
    const msg = encodeURIComponent(
      `PC HUB LK ORDER%0A%0A${cart
        .map((i) => `${i.name} - LKR ${i.price.toLocaleString()}`)
        .join("%0A")}%0A%0ATotal: LKR ${total.toLocaleString()}`
    );
    window.open(`https://wa.me/947XXXXXXXX?text=${msg}`, "_blank");
  };

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-black text-white px-6 py-4 flex justify-between">
        <h1 className="text-xl font-bold">PC HUB LK</h1>
        <div className="flex gap-6 items-center">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("shop")}>Shop</button>
          <button onClick={() => setPage("builder")}>PC Builder</button>
          <button onClick={() => setPage("checkout")} className="flex gap-1">
            <ShoppingCart /> {cart.length}
          </button>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <section className="text-center p-16 bg-gradient-to-r from-black to-gray-800 text-white">
          <h2 className="text-4xl font-bold mb-4">Custom PCs & Parts in Sri Lanka</h2>
          <p className="mb-6">Gaming | Office | Workstation | Custom Builds</p>
          <Button onClick={() => setPage("shop")}>Shop Now</Button>
        </section>
      )}

      {/* SHOP */}
      {page === "shop" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
          {products.map((p) => (
            <Card key={p.id} className="rounded-2xl shadow">
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="text-gray-500">{p.category}</p>
                <p className="font-bold mt-2">LKR {p.price.toLocaleString()}</p>
                <Button className="w-full mt-4" onClick={() => addToCart(p)}>
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PC BUILDER */}
      {page === "builder" && (
        <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {["CPU", "GPU", "RAM", "Storage"].map((type) => (
            <Card key={type}>
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Select {type}</h3>
                {products
                  .filter((p) => p.category === type)
                  .map((p) => (
                    <button
                      key={p.id}
                      className="block w-full text-left border p-2 rounded mb-2"
                      onClick={() => setBuilder({ ...builder, [type.toLowerCase()]: p })}
                    >
                      {p.name}
                    </button>
                  ))}
              </CardContent>
            </Card>
          ))}

          <Card className="md:col-span-4">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2">Your Build</h3>
              {Object.values(builder).map((b, i) => b && <p key={i}>{b.name}</p>)}
              <Button
                className="mt-4"
                onClick={() =>
                  addToCart({
                    name: "Custom PC Build",
                    price: Object.values(builder).reduce((s, i) => s + (i?.price || 0), 0),
                  })
                }
              >
                Add Build to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CHECKOUT */}
      {page === "checkout" && (
        <div className="p-8 max-w-xl mx-auto bg-white rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-4">Checkout</h2>
          {cart.map((c, i) => (
            <p key={i}>{c.name} - LKR {c.price.toLocaleString()}</p>
          ))}
          <p className="font-bold mt-4">Total: LKR {total.toLocaleString()}</p>
          <Button className="w-full mt-4" onClick={whatsappOrder}>
            Order via WhatsApp
          </Button>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-black text-white text-center p-6 mt-12">
        © 2025 PC HUB LK | Sri Lanka Custom PC Store
      </footer>
    </div>
  );
}

