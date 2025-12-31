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

  // URL පරීක්ෂාව සහ Security features (Right click & Selection prevention)
  useEffect(() => {
    // Admin Page එකට යන එක බලන්න
    if (window.location.pathname === "/admin") {
      setPage("admin");
    }

    // 1. Right Click නැවැත්වීම
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    // Cleanup function: component එක අයින් වන විට event listener එක අයින් කරයි
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Cart එකෙන් අයිතමයක් අයින් කිරීමේ function එක
  const removeFromCart = (indexToRemove) => {
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(updatedCart);
  };

  return (
    // 2. CSS හරහා Text Selection වැළැක්වීම (select-none class එකෙන්)
    <div className="min-h-screen bg-black text-white select-none">
      {/* සටහන: Tailwind පාවිච්චි කරන්නේ නම් 'select-none' class එකෙන් 
        මුළු පේජ් එකේම අකුරු සිලෙක්ට් කිරීම වළක්වයි. 
      */}
      
      {page !== "admin" && <Navbar setPage={setPage} cartCount={cart.length} />}
      
      <main>
        {page === "home" && (
          <Home setPage={setPage} cart={cart} setCart={setCart} />
        )}
        
        {page === "shop" && <Shop cart={cart} setCart={setCart} />}
        {page === "builder" && <Builder cart={cart} setCart={setCart} />}
        
        {page === "checkout" && (
          <Checkout cart={cart} removeFromCart={removeFromCart} setPage={setPage} />
        )}
        
        {page === "admin" && <Admin />}
      </main>

      {/* Input fields වලට පමණක් අකුරු ටයිප් කිරීමට ඉඩ ලබා දීම සඳහා Global CSS එකක් */}
      <style jsx global>{`
        input, textarea {
          user-select: text !important;
          -webkit-user-select: text !important;
        }
      `}</style>
    </div>
  );
}