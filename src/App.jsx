import { useState, useEffect } from "react";
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Builder from "./pages/Builder";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import MyBuilds from "./pages/MyBuilds"; // 1. MyBuilds ඉම්පෝට් කළා

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);

  // URL පරීක්ෂාව සහ Security features
  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setPage("admin");
    }

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const removeFromCart = (indexToRemove) => {
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(updatedCart);
  };

  return (
    <div className="min-h-screen bg-black text-white select-none">
      
      {/* Navbar එකට currentPage එක pass කරනවා active buttons පෙන්වන්න */}
      {page !== "admin" && (
        <Navbar 
          setPage={setPage} 
          cartCount={cart.length} 
          currentPage={page} 
        />
      )}
      
      <main>
        {page === "home" && (
          <Home setPage={setPage} cart={cart} setCart={setCart} />
        )}
        
        {page === "shop" && <Shop cart={cart} setCart={setCart} />}
        
        {page === "builder" && <Builder cart={cart} setCart={setCart} />}
        
        {/* 2. MyBuilds පේජ් එක render වන තැන */}
        {page === "mybuilds" && <MyBuilds setPage={setPage} />}
        
        {page === "checkout" && (
          <Checkout cart={cart} removeFromCart={removeFromCart} setPage={setPage} />
        )}
        
        {page === "admin" && <Admin />}
      </main>

      <style jsx global>{`
        input, textarea {
          user-select: text !important;
          -webkit-user-select: text !important;
        }
      `}</style>
    </div>
  );
}