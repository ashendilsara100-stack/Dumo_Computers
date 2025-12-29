import { useState, useEffect } from "react"; // useEffect ඇඩ් කළා
// ... අනෙක් imports එලෙසමයි

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