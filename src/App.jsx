import { useState, useEffect } from "react";
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Builder from "./pages/Builder";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);

  // URL පරීක්ෂාව
  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setPage("admin");
    }
  }, []);

  // Cart එකෙන් අයිතමයක් අයින් කිරීමේ function එක
  const removeFromCart = (indexToRemove) => {
    // Index එක පාවිච්චි කිරීම වඩාත් නිවැරදියි (එකම බඩුව දෙපාරක් තිබුණොත් එකක් විතරක් අයින් කරන්න)
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(updatedCart);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {page !== "admin" && <Navbar setPage={setPage} cartCount={cart.length} />}
      
      <main>
        {page === "home" && (
          <Home setPage={setPage} cart={cart} setCart={setCart} />
        )}
        
        {page === "shop" && <Shop cart={cart} setCart={setCart} />}
        {page === "builder" && <Builder cart={cart} setCart={setCart} />}
        
        {/* Checkout එකට removeFromCart යැවීම */}
        {page === "checkout" && (
          <Checkout cart={cart} removeFromCart={removeFromCart} setPage={setPage} />
        )}
        
        {page === "admin" && <Admin />}
      </main>
    </div>
  );
}