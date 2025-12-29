import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Builder from "./pages/Builder";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);

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

