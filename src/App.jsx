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
  
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null,
    storage: null, psu: null, case: null, cooling: null
  });

  // රහස් URL එක මෙතන Define කරන්න
  const ADMIN_SECRET_PATH = "dumo-priv-99";

  useEffect(() => {
    // Hash එක පරීක්ෂා කරලා පේජ් එක පෙන්වන ලොජික් එක
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      
      if (hash === ADMIN_SECRET_PATH) {
        setPage("admin");
      } else if (hash === "shop") {
        setPage("shop");
      } else if (hash === "builder") {
        setPage("builder");
      } else if (hash === "mybuilds") {
        setPage("mybuilds");
      } else if (hash === "checkout") {
        setPage("checkout");
      } else {
        setPage("home");
      }
    };

    // මුලින්ම ලෝඩ් වෙද්දී සහ Hash එක වෙනස් වෙද්දී මේක ක්‍රියාත්මක වෙනවා
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    const handleContextMenu = (e) => { e.preventDefault(); };
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const removeFromCart = (indexToRemove) => {
    const updatedCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(updatedCart);
  };

  return (
    <div className="min-h-screen bg-black text-white select-none">
      
      {/* Admin පේජ් එකේදී Navbar එක හංගනවා */}
      {page !== "admin" && (
        <Navbar 
          setPage={(p) => {
             // බටන් එකක් එබූ විට URL එකේ hash එක වෙනස් කරනවා
             window.location.hash = `#/${p}`;
          }} 
          cartCount={cart.length} 
          currentPage={page} 
        />
      )}
      
      <main>
        {page === "home" && <Home setPage={(p) => window.location.hash = `#/${p}`} cart={cart} setCart={setCart} />}
        {page === "shop" && <Shop cart={cart} setCart={setCart} />}
        {page === "builder" && <Builder cart={cart} setCart={setCart} selectedComponents={selectedComponents} setSelectedComponents={setSelectedComponents} />}
        {page === "mybuilds" && <MyBuilds setPage={(p) => window.location.hash = `#/${p}`} setSelectedComponents={setSelectedComponents} />}
        {page === "checkout" && <Checkout cart={cart} removeFromCart={removeFromCart} setPage={(p) => window.location.hash = `#/${p}`} />}
        
        {/* Admin පේජ් එක පෙන්වන්නේ රහස් Hash එක ආවොත් විතරයි */}
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