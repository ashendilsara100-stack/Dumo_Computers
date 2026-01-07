import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight, Coins, LayoutGrid, Share2, Facebook, MessageCircle, X, Music2, MapPinned, Filter } from "lucide-react";
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

  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 

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
        
        {/* මම මෙතන max-w-7xl අයින් කරලා සම්පූර්ණ පළල ගත්තා (Full Width) */}
        <div className="w-full max-w-[100%] mx-auto px-2 md:px-8 py-8 flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
          
          {/* SIDEBAR */}
          <aside className="hidden lg:block w-80 lg:sticky lg:top-24 z-20 space-y-6 animate-reveal-left">
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
            <div className="sticky top-20 lg:top-24 z-30 pb-6 animate-reveal-up space-y-4">
              
              <div className="lg:hidden flex overflow-x-auto gap-2 no-scrollbar pb-2">
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[9px] font-black uppercase italic border tracking-widest transition-all ${selectedCategory === "All" ? "bg-amber-500 text-black border-amber-500" : "bg-zinc-900 text-zinc-400 border-white/5"}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[9px] font-black uppercase italic border tracking-widest transition-all ${selectedCategory === cat.name ? "bg-amber-500 text-black border-amber-500" : "bg-zinc-900 text-zinc-400 border-white/5"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center bg-black/80 backdrop-blur-2xl p-3 md:p-4 rounded-[30px] md:rounded-[40px] border border-white/10 shadow-2xl">
                <div className="relative flex-1 w-full flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="text" placeholder="SEARCH HARDWARE..." 
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 py-4 md:py-5 pl-14 pr-8 rounded-[25px] md:rounded-[30px] focus:border-amber-500/50 outline-none font-black italic text-[10px] tracking-[0.2em] uppercase transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden bg-zinc-900 p-4 rounded-2xl border border-white/5 text-amber-500 shadow-xl active:scale-90 transition-transform"
                  >
                    <Filter size={20} />
                  </button>
                </div>
                <select 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="w-full xl:w-64 bg-zinc-900 border border-white/10 px-8 py-4 md:py-5 rounded-[25px] md:rounded-[30px] font-black italic text-[10px] outline-none cursor-pointer uppercase tracking-widest text-white appearance-none"
                >
                  <option value="default">SORT: RELEVANCE</option>
                  <option value="price-low">PRICE: LOW TO HIGH</option>
                  <option value="price-high">PRICE: HIGH TO LOW</option>
                  <option value="name">NAME: A-Z</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID - මම මෙතනත් gap ටිකක් අඩු කරලා width එක වැඩි කරා */}
            <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-4 md:gap-8">
              {loading ? (
                [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)
              ) : (
                filteredProducts.map((p, index) => (
                  <div 
                    key={p.id} 
                    style={{ animationDelay: `${index * 0.05}s` }}
                    className="group bg-zinc-900/30 border border-white/5 rounded-[12px] md:rounded-[45px] p-1.5 md:p-6 hover:bg-zinc-900/50 transition-all duration-700 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-sm animate-reveal-up fill-mode-both"
                  >
                    <div className="relative aspect-square bg-black/40 rounded-[8px] md:rounded-[35px] mb-1.5 md:mb-6 overflow-hidden border border-white/5">
                      <img src={p.image || "https://via.placeholder.com/400"} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                      <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md text-amber-500 text-[4px] md:text-[8px] font-black px-1 py-0.5 rounded-full uppercase italic border border-amber-500/20">
                        {p.brand}
                      </div>
                    </div>
                    <div className="flex-1 px-0.5">
                      <p className="text-amber-500 text-[5px] md:text-[9px] font-black mb-1 md:mb-2 uppercase tracking-tighter italic flex items-center gap-1">
                        <span className="w-0.5 h-0.5 bg-amber-500 rounded-full"></span> {p.category}
                      </p>
                      <h3 className="text-[7px] md:text-lg font-black text-white mb-1 md:mb-4 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2 h-4 md:h-14">
                        {p.name}
                      </h3>
                      <p className="text-[8px] md:text-2xl font-black italic tracking-tighter mb-2 md:mb-6 pt-1 md:pt-4 border-t border-white/5 text-white/90">
                        LKR {p.price.toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => addToCart(p)} className="w-full bg-white text-black py-1.5 md:py-5 rounded-[6px] md:rounded-[25px] font-black flex items-center justify-center gap-1 md:gap-2 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-[6px] md:text-[11px] tracking-widest shadow-xl">
                      <ShoppingCart size={10} className="md:w-4 md:h-4" /> 
                      <span className="hidden md:inline">Add</span>
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

        {/* MOBILE FILTER DRAWER */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[150] lg:hidden animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-[80%] bg-zinc-950 border-l border-white/10 p-8 shadow-2xl overflow-y-auto animate-reveal-right">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-lg font-black italic uppercase tracking-widest text-amber-500">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-zinc-500"><X /></button>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic">Budget (LKR)</h3>
                   <input type="range" min="0" max="1000000" step="5000" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500" />
                   <div className="text-white font-black italic text-xl">LKR {Number(priceRange).toLocaleString()}</div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic">Brands</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedBrand("All")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic ${selectedBrand === "All" ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-500"}`}>All Brands</button>
                    {brands.map(brand => (
                      <button key={brand.id} onClick={() => setSelectedBrand(brand.name)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic ${selectedBrand === brand.name ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-500"}`}>{brand.name}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setIsFilterOpen(false)} className="w-full mt-12 bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-widest">Show Results</button>
            </div>
          </div>
        )}

        {/* SOCIAL MENU */}
        <div className="fixed bottom-6 right-6 z-[100]">
          {isSocialOpen && (
            <div className="flex flex-col gap-3 mb-4 animate-reveal-up">
              <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><MapPinned size={20}/></a>
              <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><Facebook size={20}/></a>
              <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><Music2 size={20}/></a>
              <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><MessageCircle size={20}/></a>
            </div>
          )}
          <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-14 h-14 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
            {isSocialOpen ? <X size={26} /> : <Share2 size={26} />}
          </button>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes reveal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes reveal-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes reveal-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        .animate-reveal-up { animation: reveal-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-reveal-left { animation: reveal-left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-reveal-right { animation: reveal-right 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-slide-in { animation: slide-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }
        .fill-mode-both { animation-fill-mode: both; }

        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1rem; }
      `}</style>
    </div>
  );
}