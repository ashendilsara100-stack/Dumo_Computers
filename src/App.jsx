import { useState, useEffect } from "react";
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Builder from "./pages/Builder";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import MyBuilds from "./pages/MyBuilds";

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  
  // 1. බිල්ඩර් එකේ සිලෙක්ට් කරන පාර්ට්ස් ටික මෙතන තියාගන්නවා
  // එතකොට MyBuilds එකෙන් මේක අප්ඩේට් කරපු ගමන් Builder එකට ඒක පේනවා
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null
  });

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
        
        {page === "builder" && (
          <Builder 
            cart={cart} 
            setCart={setCart} 
            // 2. බිල්ඩර් එකට මේ ස්ටේට් දෙක පාස් කරන්න
            selectedComponents={selectedComponents}
            setSelectedComponents={setSelectedComponents}
          />
        )}
        
        {page === "mybuilds" && (
          <MyBuilds 
            setPage={setPage} 
            // 3. MyBuilds එකටත් මේක පාස් කරන්න (ලෝඩ් කරන්න ඕනේ නිසා)
            setSelectedComponents={setSelectedComponents} 
          />
        )}
        
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