import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Animations සඳහා
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
  
  // Builder එකේ තෝරන බඩු ටික
  const [selectedComponents, setSelectedComponents] = useState(() => {
    // බ්‍රවුසර් එක රීෆ්‍රෙෂ් කළොත් සෙෂන් එකෙන් ආයේ ගන්නවා
    const savedBuild = sessionStorage.getItem("currentBuild");
    return savedBuild ? JSON.parse(savedBuild) : {
      cpu: null, motherboard: null, ram: null, gpu: null,
      storage: null, psu: null, case: null, cooling: null
    };
  });

  const ADMIN_SECRET_PATH = "dumo-priv-99";

  // 1. Session Storage එකට Save කිරීම (බ්‍රවුසර් එක වහනකන් තියෙනවා)
  useEffect(() => {
    sessionStorage.setItem("currentBuild", JSON.stringify(selectedComponents));
  }, [selectedComponents]);

  // 2. Hash Change සහ Scroll to Top Logic
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      
      // පේජ් එක මාරු වෙන හැම වෙලාවකම උඩටම Scroll කරනවා
      window.scrollTo(0, 0);

      if (hash === ADMIN_SECRET_PATH) setPage("admin");
      else if (hash === "shop") setPage("shop");
      else if (hash === "builder") setPage("builder");
      else if (hash === "mybuilds") setPage("mybuilds");
      else if (hash === "checkout") setPage("checkout");
      else setPage("home");
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    // Context menu (Right click) block කිරීම
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

  // පේජ් එක ලෝඩ් වෙනකොට පාවිච්චි කරන Animation එක
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  return (
    <div className="min-h-screen bg-black text-white select-none">
      
      {page !== "admin" && (
        <Navbar 
          setPage={(p) => { window.location.hash = `#/${p}`; }} 
          cartCount={cart.length} 
          currentPage={page} 
        />
      )}
      
      <main>
        {/* AnimatePresence මගින් පේජ් මාරු වීම ස්මූත් කරයි */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page} // පේජ් එක මාරු වෙද්දී Animation එක trigger වෙන්න Key එක ඕනේ
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageVariants.transition}
          >
            {page === "home" && <Home setPage={(p) => window.location.hash = `#/${p}`} cart={cart} setCart={setCart} />}
            {page === "shop" && <Shop cart={cart} setCart={setCart} />}
            {page === "builder" && <Builder cart={cart} setCart={setCart} selectedComponents={selectedComponents} setSelectedComponents={setSelectedComponents} />}
            {page === "mybuilds" && <MyBuilds setPage={(p) => window.location.hash = `#/${p}`} setSelectedComponents={setSelectedComponents} />}
            {page === "checkout" && <Checkout cart={cart} removeFromCart={removeFromCart} setPage={(p) => window.location.hash = `#/${p}`} />}
            {page === "admin" && <Admin />}
          </motion.div>
        </AnimatePresence>
      </main>

      <style jsx global>{`
        input, textarea {
          user-select: text !important;
          -webkit-user-select: text !important;
        }
        /* Scrollbar එක ලස්සන කරන්න (Space Theme එකට) */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}