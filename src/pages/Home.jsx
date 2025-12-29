import { useEffect, useState } from "react";
import { ShoppingCart, Search, Filter, Zap, TrendingUp, Star, Package, CheckCircle, ArrowRight, ShieldCheck, Truck } from "lucide-react";

// Home page ekata galapena Featured Products keepayak witarak gannawa
const featuredProducts = [
  { id: 1, name: "AMD Ryzen 5 5600X", category: "CPU", price: 72000 },
  { id: 2, name: "NVIDIA RTX 4060 Ti", category: "GPU", price: 185000 },
  { id: 3, name: "Corsair Vengeance 16GB DDR4", category: "RAM", price: 28000 },
  { id: 4, name: "Samsung 970 EVO 1TB NVMe", category: "Storage", price: 35000 },
];

export default function Home({ cart, setCart }) {
  const [products, setProducts] = useState(featuredProducts);

  const addToCart = (p) => {
    setCart([...cart, p]);
    // Notification logic...
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* 1. HERO SECTION (ALUTHIN EK KALA) */}
      <div className="relative h-[70vh] flex items-center overflow-hidden border-b-2 border-white/10">
        {/* Background Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 text-center lg:text-left">
            <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 animate-pulse">
              NEW ARRIVALS 2025
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none">
              LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium">
              Sri Lanka's most trusted destination for high-end gaming PC components and custom builds.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group">
                SHOP NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <button className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all">
                BUILD YOUR PC
              </button>
            </div>
          </div>
          
          {/* Hero Visual - Icon or Illustration */}
          <div className="hidden lg:flex justify-center animate-bounce-slow">
             <div className="relative p-12 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm">
                <Package className="w-64 h-64 text-amber-500 opacity-80" />
                <div className="absolute -top-4 -right-4 bg-white text-black p-6 rounded-2xl font-black shadow-2xl rotate-12">
                   LKR 185,000+
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. TRUST BADGES SECTION */}
      <div className="bg-white text-black py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8">
          <div className="flex items-center gap-4">
            <Truck className="w-10 h-10" />
            <div><p className="font-black leading-none">ISLANDWIDE DELIVERY</p><p className="text-sm">Safe & Secure Shipping</p></div>
          </div>
          <div className="flex items-center gap-4 border-x-0 md:border-x border-black/10 px-0 md:px-12">
            <ShieldCheck className="w-10 h-10" />
            <div><p className="font-black leading-none">GENUINE WARRANTY</p><p className="text-sm">Official Brand Warranty</p></div>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10" />
            <div><p className="font-black leading-none">TECH SUPPORT</p><p className="text-sm">Expert Advice Anytime</p></div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED PRODUCTS (MODIFIED GRID) */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black mb-2 italic">FEATURED HARDWARE</h2>
            <div className="w-20 h-2 bg-amber-500"></div>
          </div>
          <button className="hidden md:flex items-center gap-2 text-amber-500 font-black hover:underline">
            VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div key={p.id} className="group relative bg-zinc-900/50 border border-white/10 p-6 rounded-3xl hover:bg-zinc-800 transition-all">
              <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                <Package className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-amber-500 transition-colors">{p.name}</h3>
              <p className="text-2xl font-black mb-6 tracking-tight">LKR {p.price.toLocaleString()}</p>
              <button 
                onClick={() => addToCart(p)}
                className="w-full py-4 bg-white text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-5 h-5" /> ADD
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CALL TO ACTION (MODIFIED) */}
      <div className="bg-amber-500 py-20 px-6 text-black text-center mx-6 mb-12 rounded-[50px]">
         <h2 className="text-5xl font-black mb-6 italic">READY TO BUILD YOUR DREAM RIG?</h2>
         <p className="text-xl font-bold mb-8 max-w-2xl mx-auto opacity-80">
           Our experts are ready to help you choose the best parts for your budget. WhatsApp us for a custom quote.
         </p>
         <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-transform">
           GET A QUOTE NOW
         </button>
      </div>
    </div>
  );
}