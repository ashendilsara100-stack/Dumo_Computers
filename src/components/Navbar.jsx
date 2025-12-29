import { ShoppingCart } from "lucide-react";

export default function Navbar({ setPage, cartCount }) {
  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold cursor-pointer" onClick={() => setPage("home")}>
        Dumo Computers
      </h1>

      <div className="flex gap-6 items-center">
        <button onClick={() => setPage("shop")}>Shop</button>
        <button onClick={() => setPage("builder")}>PC Builder</button>
        <button onClick={() => setPage("checkout")} className="flex gap-1">
          <ShoppingCart /> {cartCount}
        </button>
        <button onClick={() => setPage("admin")}>Admin</button>
      </div>
    </nav>
  );
}

