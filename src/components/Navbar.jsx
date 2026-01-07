import { ShoppingCart, Menu, X, Package, Wrench, Home, Shield } from "lucide-react";
import { useState } from "react";

export default function Navbar({ setPage, cartCount, currentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "shop", label: "Shop", icon: Package },
    { id: "builder", label: "PC Builder", icon: Wrench }
  ];

  const handleNavClick = (page) => {
    setPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar - සම්පූර්ණ පළලට විහිදෙන ලෙස සකස් කර ඇත */}
      <nav className="bg-black/20 backdrop-blur-md text-white border-b-2 border-white sticky top-0 z-50 w-full">
        {/* max-w-7xl අයින් කර px (padding) වැඩි කරන ලදී */}
        <div className="w-full px-6 lg:px-12 py-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick("home")}
            >
              <Package className="w-8 h-8 text-white group-hover:text-amber-500 transition-colors" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-amber-500 transition-colors">
                DUMO COMPUTERS
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all border-2 ${
                      isActive
                        ? "bg-white text-black border-white"
                        : "bg-black/40 text-white border-white hover:bg-white hover:text-black hover:border-amber-500 hover:scale-105"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Cart Button */}
              <button
                onClick={() => handleNavClick("checkout")}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all border-2 ${
                  currentPage === "checkout"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-black border-white hover:bg-amber-500 hover:text-white hover:scale-105"
                }`}
              >
                <ShoppingCart size={18} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white hover:text-black transition-all rounded-lg border-2 border-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full max-w-sm flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-black text-xl transition-all border-2 ${
                    isActive
                      ? "bg-white text-black border-white scale-105"
                      : "bg-black text-white border-white hover:bg-white hover:text-black hover:border-amber-500"
                  }`}
                >
                  <Icon size={24} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile Cart Button */}
            <button
              onClick={() => handleNavClick("checkout")}
              className={`relative w-full max-w-sm flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-black text-xl transition-all border-2 ${
                currentPage === "checkout"
                  ? "bg-amber-500 text-white border-amber-500 scale-105"
                  : "bg-white text-black border-white hover:bg-amber-500 hover:text-white"
              }`}
            >
              <ShoppingCart size={24} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-2 bg-black text-white px-3 py-1 rounded-full text-sm font-black border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-8 px-8 py-4 bg-white text-black rounded-xl font-black border-2 border-white hover:bg-amber-500 hover:text-white transition-all"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
}