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

  // URL එක `/admin` ද කියලා පරීක්ෂා කරනවා
  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setPage("admin");
    }
  }, []);

  return (
    <>
      <Navbar setPage={setPage} cartCount={cart.length} />
      {page === "home" && <Home setPage={setPage} />}
      {page === "shop" && <Shop cart={cart} setCart={setCart} />}
      {page === "builder" && <Builder cart={cart} setCart={setCart} />}
      {page === "checkout" && <Checkout cart={cart} />}
      {page === "admin" && <Admin />}
    </>
  );
}
