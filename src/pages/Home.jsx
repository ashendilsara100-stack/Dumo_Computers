import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";

export default function Home({ setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);

  // Firebase එකෙන් Products ලෝඩ් කිරීම
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), limit(4));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: doc.data().sellingPrice || 0 
        }));
        setProducts(items);
      } catch (error) {
        console.error("Firebase Error:", error);
      }
    };
    fetchFeatured();
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[70vh] flex items-center overflow-hidden border-b-2 border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 text-center lg:text-left">
            <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 animate-pulse uppercase">
              New Arrivals 2025
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase">
              LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium">
              Sri Lanka's most trusted destination for high-end gaming PC components and custom builds.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {/* setPage පාවිච්චි කරලා පේජ් මාරු කිරීම */}
              <button 
                onClick={() => setPage("shop")}
                className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic"
              >
                SHOP NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => setPage("builder")}
                className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic"
              >
                BUILD YOUR PC
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center">
             <div className="relative p-12 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm">
                <Package className="w-64 h-64 text-amber-500 opacity-80" />
                <div className="absolute -top-4 -right-4 bg-white text-black p-6 rounded-2xl font-black shadow-2xl rotate-12">
                   PREMIUM STOCKS
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. TRUST BADGES */}
      <div className="bg-white text-black py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8">
          <div className="flex items-center gap-4">
            <Truck className="w-10 h-10" />
            <div><p className="font-black leading-none uppercase">Islandwide Delivery</p><p className="text-sm">Safe & Secure Shipping</p></div>
          </div>
          <div className="flex items-center gap-4 border-x-0 md:border-x border-black/10 px-0 md:px-12">
            <ShieldCheck className="w-10 h-10" />
            <div><p className="font-black leading-none uppercase">Genuine Warranty</p><p className="text-sm">Official Brand Warranty</p></div>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10" />
            <div><p className="font-black leading-none uppercase">Tech Support</p><p className="text-sm">Expert Advice Anytime</p></div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED PRODUCTS */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black mb-2 italic uppercase">Featured Hardware</h2>
            <div className="w-20 h-2 bg-amber-500"></div>
          </div>
          <button 
            onClick={() => setPage("shop")}
            className="hidden md:flex items-center gap-2 text-amber-500 font-black hover:underline uppercase italic text-sm"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div key={p.id} className="group relative bg-zinc-900/50 border border-white/10 p-6 rounded-3xl hover:bg-zinc-800 transition-all">
              <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 border border-white/5 overflow-hidden">
                <img 
                  src={p.image || "https://via.placeholder.com/150"} 
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-amber-500 transition-colors truncate uppercase italic">{p.name}</h3>
              <p className="text-2xl font-black mb-6 tracking-tight italic">LKR {p.price.toLocaleString()}</p>
              <button 
                onClick={() => addToCart(p)}
                className="w-full py-4 bg-white text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 active:scale-95 transition-all uppercase italic"
              >
                <ShoppingCart className="w-5 h-5" /> Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CALL TO ACTION */}
      <div className="bg-amber-500 py-20 px-6 text-black text-center mx-6 mb-12 rounded-[50px]">
         <h2 className="text-5xl font-black mb-6 italic uppercase">Ready to build your dream rig?</h2>
         <p className="text-xl font-bold mb-8 max-w-2xl mx-auto opacity-80">
            Our experts are ready to help you choose the best parts for your budget. WhatsApp us for a custom quote.
         </p>
         <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer">
            <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all uppercase italic">
              Get a Quote Now
            </button>
         </a>
      </div>
    </div>
  );
}