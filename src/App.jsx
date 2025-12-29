import { useState, useEffect } from "react";
import Navbar from "./components/Navbar"; // Import එක තහවුරු කරන්න
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Builder from "./pages/Builder";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);

  // URL එක `/admin` ද කියලා පරීක්ෂා කරලා page එක මාරු කිරීම
  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setPage("admin");
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin පේජ් එකේදී Navbar එක පෙන්නන්න ඕනේ නැත්නම් මේ check එක තියන්න */}
      {page !== "admin" && <Navbar setPage={setPage} cartCount={cart.length} />}
      
      <main>
        {page === "home" && <Home setPage={setPage} />}
        {page === "shop" && <Shop cart={cart} setCart={setCart} />}
        {page === "builder" && <Builder cart={cart} setCart={setCart} />}
        {page === "checkout" && <Checkout cart={cart} />}
        {page === "admin" && <Admin />}
      </main>
    </div>
  );
}