import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, Coins, Filter, AlertCircle } from "lucide-react";

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(1000000);

  useEffect(() => {
    // 1. Fetch Products
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // 2. Fetch Categories (A-Z, Others at bottom)
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      let catList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      catList.sort((a, b) => {
        if (a.name.toLowerCase() === 'others') return 1;
        if (b.name.toLowerCase() === 'others') return -1;
        return a.name.localeCompare(b.name);
      });
      setCategories(catList);
    });

    // 3. Fetch Brands (A-Z)
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      let brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      brandList.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(brandList);
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  // --- SMART MATCH LOGIC (Fuzzy Match) ---
  const isMatch = (text, query) => {
    if (!query) return true;
    if (!text) return false;
    const s = query.toLowerCase().trim();
    const t = text.toLowerCase();
    
    if (t.includes(s)) return true;

    let mistakes = 0;
    let j = 0;
    for (let i = 0; i < s.length && j < t.length; i++) {
      if (s[i] === t[j]) j++;
      else mistakes++;
    }
    return mistakes <= 2; 
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const searchMatch = isMatch(p.name, searchTerm) || isMatch(p.category, searchTerm) || isMatch(p.brand, searchTerm);
    const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
    const brandMatch = selectedBrand === "All" || p.brand === selectedBrand;
    const priceMatch = Number(p.sellingPrice) <= priceRange;
    return searchMatch && categoryMatch && brandMatch && priceMatch;
  });

  // Suggestions for "Did you mean?"
  const suggestions = searchTerm.length > 2 ? products.filter(p => 
    isMatch(p.name, searchTerm) && !filteredProducts.includes(p)
  ).slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 overflow-x-hidden">
      
      {/* Container with top spacing for Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-10 flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR SECTION */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-28 space-y-6">
            
            {/* 1. PRICE FILTER */}
            <div className="bg-zinc-900/40 p-6 rounded-[35px] border border-amber-500/10 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-amber-500/5 group-hover:text-amber-500/10 transition-colors">
                <Coins size={80} />
              </div>
              <h3 className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase italic mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Max Budget
              </h3>
              <p className="font-black italic text-xl text-white mb-4 leading-none">LKR {Number(priceRange).toLocaleString()}</p>
              <input 
                type="range" min="0" max="1000000" step="5000"
                value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* 2. SEARCH WITH SUGGESTIONS */}
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input 
                type="text" placeholder="TYPE ANYTHING..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/20 border border-white/5 py-4 pl-14 pr-6 rounded-[22px] outline-none focus:border-amber-500/30 font-black italic text-[11px] tracking-widest uppercase"
              />
              
              {searchTerm && filteredProducts.length === 0 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-zinc-900/95 border border-white/10 mt-2 rounded-2xl p-4 z-50 shadow-2xl backdrop-blur-xl">
                  <p className="text-[9px] font-black text-amber-500 mb-2 uppercase tracking-widest italic">Did you mean?</p>
                  {suggestions.map(s => (
                    <button key={s.id} onClick={() => setSearchTerm(s.name)} className="block w-full text-left text-[10px] font-bold py-2 hover:text-amber-500 truncate italic uppercase transition-colors">
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. CATEGORIES */}
            <div className="bg-zinc-900/20 p-6 rounded-[35px] border border-white/5 backdrop-blur-md shadow-xl">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic mb-4">Categories</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[200px] pb-2 lg:pb-0 custom-scrollbar whitespace-nowrap lg:whitespace-normal">
                <button 
                  onClick={() => setSelectedCategory("All")} 
                  className={`px-5 py-2.5 rounded-xl font-black italic uppercase text-[10px] transition-all flex-shrink-0 ${selectedCategory === "All" ? "bg-white text-black translate-x-1" : "text-zinc-500 hover:text-white"}`}
                >
                  All Components
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.name)} 
                    className={`px-5 py-2.5 rounded-xl font-black italic uppercase text-[10px] transition-all flex-shrink-0 ${selectedCategory === cat.name ? "bg-white text-black translate-x-1" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. BRANDS */}
            <div className="bg-zinc-900/20 p-6 rounded-[35px] border border-white/5 backdrop-blur-md shadow-xl">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic mb-4">Brands</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[200px] pb-2 lg:pb-0 custom-scrollbar whitespace-nowrap lg:whitespace-normal">
                <button 
                  onClick={() => setSelectedBrand("All")} 
                  className={`px-5 py-2.5 rounded-xl font-black italic uppercase text-[10px] transition-all flex-shrink-0 ${selectedBrand === "All" ? "bg-amber-500 text-black translate-x-1" : "text-zinc-500 hover:text-white"}`}
                >
                  All Brands
                </button>
                {brands.map(brand => (
                  <button 
                    key={brand.id} 
                    onClick={() => setSelectedBrand(brand.name)} 
                    className={`px-5 py-2.5 rounded-xl font-black italic uppercase text-[10px] transition-all flex-shrink-0 ${selectedBrand === brand.name ? "bg-amber-500 text-black translate-x-1" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN GRID SECTION */}
        <main className="flex-1">
          <div className="mb-10">
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Catalog</h2>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Showing {filteredProducts.length} Components</p>
              {searchTerm && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest">Searching: {searchTerm}</span>}
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-pulse">
               {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-zinc-900/20 rounded-[40px] border border-white/5"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/10 border border-white/5 rounded-[40px] p-4 md:p-6 hover:bg-zinc-900/30 transition-all duration-500 flex flex-col shadow-2xl overflow-hidden">
                  <div className="relative aspect-square bg-black rounded-[25px] md:rounded-[35px] mb-6 overflow-hidden border border-white/5">
                    <img 
                      src={p.image || "https://via.placeholder.com/300/000000/FFFFFF?text=No+Image"} 
                      alt={p.name} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0" 
                    />
                  </div>
                  <div className="flex-1 px-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-amber-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] italic">{p.category}</p>
                      <span className="text-[8px] md:text-[10px] font-black text-white/30 uppercase italic">{p.brand}</span>
                    </div>
                    <h3 className="text-sm md:text-xl font-black text-white mb-4 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2">{p.name}</h3>
                    <p className="text-lg md:text-2xl font-black italic tracking-tighter mb-6 border-t border-white/5 pt-4">LKR {Number(p.sellingPrice).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setCart([...cart, p])} 
                    className="w-full bg-white text-black py-4 md:py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-[10px] md:text-[11px] tracking-widest"
                  >
                    <ShoppingCart size={14} className="hidden md:block" /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-32 bg-zinc-900/5 rounded-[50px] border border-dashed border-white/10">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-zinc-800" />
              <p className="text-zinc-600 font-black italic uppercase tracking-widest text-xs">Zero items found in this section</p>
              <button onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedBrand("All");}} className="mt-6 text-amber-500 font-black uppercase italic text-[10px] tracking-widest underline underline-offset-4">Reset View</button>
            </div>
          )}
        </main>
      </div>
      
      {/* CUSTOM SCROLLBAR CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 2px; width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>
    </div>
  );
}