import { ShoppingCart, Menu, X, Package, Wrench, Home, Shield, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

export default function Navbar({ setPage, cartCount, currentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  // යූසර් ලොග් වෙලාද කියලා හැමතිස්සෙම චෙක් කරනවා
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

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
      {/* Desktop Navbar - w-full සහ px පාවිච්චි කරලා දෙපැත්තේ ඉඩ අයින් කරා */}
      <nav className="bg-black/20 backdrop-blur-md text-white border-b-2 border-white sticky top-0 z-50 w-full">
        <div className="w-full px-4 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group shrink-0"
              onClick={() => handleNavClick("home")}
            >
              <Package className="w-8 h-8 text-white group-hover:text-amber-500 transition-colors" />
              <h1 className="text-xl md:text-3xl font-black tracking-tight group-hover:text-amber-500 transition-colors uppercase italic">
                DUMO COMPUTERS
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black transition-all border-2 text-xs uppercase italic ${
                      isActive
                        ? "bg-white text-black border-white"
                        : "bg-black/40 text-white border-white hover:bg-white hover:text-black hover:border-amber-500 hover:scale-105"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Cart Button */}
              <button
                onClick={() => handleNavClick("checkout")}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-black transition-all border-2 text-xs uppercase italic ${
                  currentPage === "checkout"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-black border-white hover:bg-amber-500 hover:text-white hover:scale-105"
                }`}
              >
                <ShoppingCart size={16} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* --- LOGIN / USER PROFILE SECTION --- */}
              <div className="ml-2 border-l border-white/20 pl-4">
                {user ? (
                  <div className="flex items-center gap-3 bg-zinc-900/80 p-1.5 pr-4 rounded-2xl border border-white/10 group">
                    <img 
                        src={user.photoURL} 
                        className="w-9 h-9 rounded-xl border-2 border-amber-500 group-hover:scale-110 transition-transform" 
                        alt="profile" 
                    />
                    <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-black uppercase italic leading-none">Account</span>
                        <span className="text-[11px] font-black italic text-white uppercase truncate max-w-[80px]">
                            {user.displayName.split('')[0]}
                        </span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="ml-2 p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                        title="Logout"
                    >
                        <LogOut size={16}/>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-black bg-white text-black border-2 border-white hover:bg-amber-500 hover:text-white transition-all text-xs uppercase italic"
                  >
                    <User size={16} />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
                {user && <img src={user.photoURL} className="w-9 h-9 rounded-full border-2 border-amber-500" alt="profile" />}
                <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-white hover:text-black transition-all rounded-lg border-2 border-white"
                >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full max-w-sm flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-black text-xl transition-all border-2 italic uppercase ${
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

            {/* Mobile Login/Logout */}
            {!user ? (
                <button
                    onClick={handleGoogleLogin}
                    className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-black text-xl bg-amber-500 text-black border-2 border-amber-500 italic uppercase"
                >
                    <User size={24} /> Login with Google
                </button>
            ) : (
                <button
                    onClick={handleLogout}
                    className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-black text-xl bg-red-500/20 text-red-500 border-2 border-red-500 italic uppercase"
                >
                    <LogOut size={24} /> Logout ({user.displayName.split(' ')[0]})
                </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-8 text-zinc-500 font-black uppercase italic tracking-widest"
            >
              [ Close Menu ]
            </button>
          </div>
        </div>
      )}
    </>
  );
}