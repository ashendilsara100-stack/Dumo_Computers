import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Navigation සඳහා
import { ShoppingCart, Zap, Package, ArrowRight, ShieldCheck, Truck } from "lucide-react";

// Featured products (Database එකෙන් එනකම් තාවකාලිකව)
const featuredProducts = [
  { id: 1, name: "AMD Ryzen 5 5600X", category: "CPU", price: 72000 },
  { id: 2, name: "NVIDIA RTX 4060 Ti", category: "GPU", price: 185000 },
  { id: 3, name: "Corsair Vengeance 16GB DDR4", category: "RAM", price: 28000 },
  { id: 4, name: "Samsung 970 EVO 1TB NVMe", category: "Storage", price: 35000 },
];

export default function Home({ cart, setCart }) {
  const [products, setProducts] = useState(featuredProducts);

  // WhatsApp Link Setup
  const whatsappNumber = "94771234567"; // ඔයාගේ අංකය මෙතනට දාන්න
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20DUMO!%20I%20want%20to%20get%20a%20custom%20PC%20quote.`;

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      
      {/* 1. HERO SECTION - (කලින් තිබුණු ලස්සනම Layout එක) */}
      <div className="relative h-[85vh] flex items-center overflow-hidden border-b border-white/5">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
              <span className="text-xs font-black tracking-[0.3em] uppercase opacity-70">New Season 2025</span>
            </div>

            <h1 className="text-7xl md:text-[110px] font-black italic tracking-tighter leading-[0.85] uppercase">
              Level Up <br /> <span className="text-amber-500">Your Game.</span>
            </h1>
            
            <p className="text-xl text-zinc-500 max-w-lg font-medium italic">
              Sri Lanka's premier destination for high-performance hardware and elite custom PC builds.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {/* Shop Now Link */}
              <Link to="/shop" className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-2 group italic uppercase">
                Shop Now <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>

              {/* PC Builder Link */}
              <Link to="/pc-builder" className="px-10 py-5 border border-white/20 font-black rounded-2xl hover:bg-white hover:text-black transition-all italic uppercase">
                Build Your PC
              </Link>
            </div>
          </div>
          
          {/* Hero Image / Graphic */}
          <div className="hidden lg:block relative">
            <div className="relative z-10 p-4 bg-zinc-900/20 border border-white/5 backdrop-blur-3xl rounded-[60px] transform rotate-3 hover:rotate-0 transition-transform duration-700">
               <div className="bg-zinc-950 p-12 rounded-[50px] border border-white/10">
                  <Package size={280} className="text-amber-500 opacity-20 mx-auto" />
                  <div className="absolute top-10 right-10 bg-amber-500 text-black px-6 py-3 rounded-2xl font-black -rotate-12 shadow-2xl">
                    RTX 40 SERIES
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRUST BADGES */}
      <div className="bg-white text-black py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex items-center gap-6 group">
            <Truck size={40} className="group-hover:scale-110 transition-transform" />
            <div><p className="font-black text-lg leading-none uppercase italic">Islandwide Delivery</p><p className="text-sm font-bold opacity-60">Doorstep delivery within 48h</p></div>
          </div>
          <div className="flex items-center gap-6 border-y md:border-y-0 md:border-x border-black/10 py-8 md:py-0 md:px-12 group">
            <ShieldCheck size={40} className="group-hover:scale-110 transition-transform" />
            <div><p className="font-black text-lg leading-none uppercase italic">Official Warranty</p><p className="text-sm font-bold opacity-60">100% Genuine Components</p></div>
          </div>
          <div className="flex items-center gap-6 group">
            <Zap size={40} className="group-hover:scale-110 transition-transform" />
            <div><p className="font-black text-lg leading-none uppercase italic">Expert Support</p><p className="text-sm font-bold opacity-60">After-sales tech assistance</p></div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED HARDWARE SECTION */}
      <div className="max-w-7xl mx-auto px-8 py-32">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter">Featured <br/> <span className="text-amber-500 text-4xl">Hardware</span></h2>
          <Link to="/shop" className="font-black text-amber-500 hover:text-white transition-colors flex items-center gap-2 italic">
            BROWSE ALL <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div key={p.id} className="group bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] hover:bg-zinc-900/60 transition-all border-b-4 border-b-transparent hover:border-b-amber-500">
              <div className="aspect-square bg-black rounded-3xl flex items-center justify-center mb-8 border border-white/5 overflow-hidden">
                <Package className="w-24 h-24 text-zinc-800 group-hover:scale-125 transition-transform duration-700" />
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{p.category}</p>
              <h3 className="font-black text-xl mb-6 italic uppercase leading-tight">{p.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black italic">LKR {p.price.toLocaleString()}</span>
                <button onClick={() => addToCart(p)} className="p-4 bg-white text-black rounded-2xl hover:bg-amber-500 transition-all">
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CALL TO ACTION - WHATSAPP LINKED */}
      <div className="mx-8 mb-20 relative overflow-hidden rounded-[60px] bg-gradient-to-r from-amber-500 to-amber-600 p-20 text-black text-center">
         <div className="relative z-10">
            <h2 className="text-6xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase leading-none">Ready to build <br/> your dream rig?</h2>
            <p className="text-xl font-bold mb-12 max-w-2xl mx-auto opacity-80">
               Chat with our experts on WhatsApp to get a custom quote and the best advice for your setup.
            </p>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-black text-white px-16 py-6 rounded-3xl font-black text-2xl hover:scale-105 active:scale-95 transition-all uppercase italic"
            >
              Get a Quote Now
            </a>
         </div>
      </div>
    </div>
  );
}