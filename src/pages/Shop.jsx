import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight, Coins, LayoutGrid } from "lucide-react";
import SpaceBackground from "../components/SpaceBackground";

const categorySynonyms = {
  gpu: ["graphic card", "vga", "graphics card", "video card", "gpu", "nvidia", "rtx", "gtx", "radeon", "display"],
  cpu: ["processor", "chip", "intel", "amd", "ryzen", "core i", "cpu", "processor"],
  ram: ["memory", "desktop ram", "ddr4", "ddr5", "ram", "memory"],
  psu: ["power supply", "power unit", "watt", "psu", "650w", "750w", "850w"],
  storage: ["ssd", "hard drive", "hdd", "nvme", "m.2", "sata", "storage", "internal storage"],
  cooling: ["fan", "cooler", "heatsink", "liquid cool", "aio", "cooling", "fan"],
  motherboard: ["board", "mobo", "mainboard", "motherboard", "mb"]
};

// --- SKELETON COMPONENT ---
const SkeletonCard = () => (
  <div className="bg-zinc-900/30 border border-white/5 rounded-[35px] p-6 animate-pulse">
    <div className="aspect-square bg-white/5 rounded-[25px] mb-6"></div>
    <div className="h-4 bg-white/5 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-white/5 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-white/5 rounded w-full"></div>
  </div>
);

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(1000000); 
  const [sortBy, setSortBy] = useState("default");

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const searchLower = searchTerm.toLowerCase().trim();
      const productName = (p.name || "").toLowerCase();
      const productCat = (p.category || "").toLowerCase();
      const productBrand = (p.brand || "").toLowerCase();

      const isSynonymMatch = Object.keys(categorySynonyms).some(key => 
        categorySynonyms[key].some(syn => syn.includes(searchLower)) && productCat.includes(key)
      );

      const nameMatch = productName.includes(searchLower) || productBrand.includes(searchLower);
      const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
      const brandMatch = selectedBrand === "All" || p.brand === selectedBrand;
      const priceMatch = p.price <= priceRange;

      return categoryMatch && brandMatch && priceMatch && (nameMatch || isSynonymMatch || searchTerm === "");
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        price: Number(doc.data().sellingPrice) || 0 
      })));
      setLoading(false);
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 right-10 bg-amber-500 text-black px-8 py-4 rounded-2xl shadow-2xl z-[100] font-black flex items-center gap-3 italic uppercase text-sm border-2 border-black animate-slide-in';
    toast.innerHTML = `🚀 ${p.name} ADDED!`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <SpaceBackground />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-28 flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black animate-fade-in">
          <span>DUMO STORE</span> <ChevronRight size={12} className="text-amber-500" /> <span className="text-amber-500 italic">Inventory</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
          
          {/* SIDEBAR with slide-right animation */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-24 z-20 space-y-6 animate-reveal-left">
            <div className="bg-zinc-900/60 p-6 md:p-8 rounded-[35px] border border-white/5 backdrop-blur-xl shadow-2xl">
              <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic flex items-center gap-2">
                <Coins size={14} /> Budget Filter
              </h3>
              <input 
                type="range" min="0" max="1000000" step="5000"
                value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="mt-4 text-white font-black italic text-lg">LKR {Number(priceRange).toLocaleString()}</div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md p-6 md:p-8 rounded-[35px] border border-white/5 shadow-2xl max-h-[350px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-zinc-500 uppercase italic flex items-center gap-2">
                <LayoutGrid size={12}/> Categories
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => setSelectedCategory("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedCategory === "All" ? "bg-white text-black translate-x-2" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>All Components</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedCategory === cat.name ? "bg-white text-black translate-x-2" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>{cat.name}</button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md p-6 md:p-8 rounded-[35px] border border-white/5 shadow-2xl max-h-[350px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-zinc-500 uppercase italic">Popular Brands</h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => setSelectedBrand("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedBrand === "All" ? "bg-amber-500 text-black translate-x-2" : "text-zinc-500 hover:text-white"}`}>All Brands</button>
                {brands.map(brand => (
                  <button key={brand.id} onClick={() => setSelectedBrand(brand.name)} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedBrand === brand.name ? "bg-amber-500 text-black translate-x-2" : "text-zinc-500 hover:text-white"}`}>{brand.name}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN AREA */}
          <main className="flex-1 w-full">
            <div className="sticky top-20 lg:top-24 z-30 pb-6 animate-reveal-up">
              <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center bg-black/80 backdrop-blur-2xl p-4 rounded-[40px] border border-white/10 shadow-2xl">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" placeholder="SEARCH HARDWARE..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 py-5 pl-16 pr-8 rounded-[30px] focus:border-amber-500/50 outline-none font-black italic text-[11px] tracking-[0.2em] uppercase transition-all"
                  />
                </div>
                <select 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="w-full xl:w-64 bg-zinc-900 border border-white/10 px-8 py-5 rounded-[30px] font-black italic text-[11px] outline-none cursor-pointer uppercase tracking-widest text-white appearance-none"
                >
                  <option value="default">SORT: RELEVANCE</option>
                  <option value="price-low">PRICE: LOW TO HIGH</option>
                  <option value="price-high">PRICE: HIGH TO LOW</option>
                  <option value="name">NAME: A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
              {loading ? (
                // Show 6 skeleton cards while loading
                [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
              ) : (
                filteredProducts.map((p, index) => (
                  <div 
                    key={p.id} 
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className="group bg-zinc-900/30 border border-white/5 rounded-[35px] md:rounded-[45px] p-4 md:p-6 hover:bg-zinc-900/50 transition-all duration-700 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-sm animate-reveal-up fill-mode-both"
                  >
                    <div className="relative aspect-square bg-black/40 rounded-[25px] md:rounded-[35px] mb-6 overflow-hidden border border-white/5">
                      <img src={p.image || "https://via.placeholder.com/400"} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-500 text-[8px] font-black px-3 py-1.5 rounded-full uppercase italic border border-amber-500/20">
                        {p.brand}
                      </div>
                    </div>
                    <div className="flex-1 px-1">
                      <p className="text-amber-500 text-[9px] font-black mb-2 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {p.category}
                      </p>
                      <h3 className="text-sm md:text-lg font-black text-white mb-4 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2 h-10 md:h-14">
                        {p.name}
                      </h3>
                      <p className="text-lg md:text-2xl font-black italic tracking-tighter mb-6 pt-4 border-t border-white/5">
                        LKR {p.price.toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => addToCart(p)} className="w-full bg-white text-black py-4 md:py-5 rounded-[20px] md:rounded-[25px] font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-[10px] md:text-[11px] tracking-widest shadow-xl">
                      <ShoppingCart size={16} /> Add To Cart
                    </button>
                  </div>
                ))
              )}
            </div>

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-40 animate-fade-in">
                <Package size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                <p className="text-zinc-500 font-black italic uppercase text-xs tracking-widest">No hardware found matching your criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        
        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes reveal-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-reveal-up { animation: reveal-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-reveal-left { animation: reveal-left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-slide-in { animation: slide-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        .animate-fade-in { animation: fade-in 1s ease-out both; }
        .fill-mode-both { animation-fill-mode: both; }

        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1rem; }
      `}</style>
    </div>
  );
}